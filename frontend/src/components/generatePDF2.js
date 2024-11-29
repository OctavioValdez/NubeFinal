const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const { PDFDocument } = require('pdf-lib');

// Carga el archivo HTML
const loadTemplate = async (filePath) => {
    try {
        return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
        console.error('Error loading the HTML template:', error);
        throw error;
    }
};

// Rellena las variables en el HTML con los datos del JSON
const replaceTemplate = (template, data) => {
    let filledTemplate = template;

    // Reemplaza todas las variables en el template
    for (const key in data) {
        if (key === 'products') continue;
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        const value = typeof data[key] === 'number'
            ? data[key].toLocaleString('en-US', { minimumFractionDigits: 2 })
            : data[key];
        filledTemplate = filledTemplate.replace(regex, value);
    }

    // Maneja la sección de productos
    if (data.products) {
        const productRows = data.products
            .map((product) => {
                const importe = (product.cantidad * product.precio).toLocaleString('en-US', { minimumFractionDigits: 2 });
                return `
                    <tr style="text-align: center; color: black; font-size: 16px; height: 40px;">
                        <td style="width: 70px;">${product.cantidad}</td>
                        <td style="width: 350px;">${product.producto}</td>
                        <td style="width: 90px;">${product.precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td style="width: 90px;">${importe}</td>
                    </tr>
                `;
            })
            .join('');
        filledTemplate = filledTemplate.replace('{{products}}', productRows);
    } else {
        filledTemplate = filledTemplate.replace('{{products}}', '');
    }

    return filledTemplate;
};

// Genera un único archivo PDF con todas las páginas combinadas
const generatePDF = async (htmlFilePath, outputPath, jsonData) => {
    try {
        const htmlTemplate = await loadTemplate(htmlFilePath);

        // Divide los productos en lotes de 6
        const maxProducts = 6;
        const productChunks = [];
        for (let i = 0; i < jsonData.products.length; i += maxProducts) {
            productChunks.push(jsonData.products.slice(i, i + maxProducts));
        }

        const browser = await puppeteer.launch();
        const tempPdfPaths = [];

        for (let i = 0; i < productChunks.length; i++) {
            const page = await browser.newPage();
            const currentData = { ...jsonData, products: productChunks[i] };

            const filledHtml = replaceTemplate(htmlTemplate, currentData);

            await page.setContent(filledHtml, { waitUntil: 'domcontentloaded' });

            const tempPdfPath = `./temp_${i + 1}.pdf`;
            await page.pdf({
                path: tempPdfPath,
                format: 'letter',
                printBackground: true,
            });

            tempPdfPaths.push(tempPdfPath);
        }

        await browser.close();

        const mergedPdf = await PDFDocument.create();

        for (const tempPdfPath of tempPdfPaths) {
            const pdfBytes = await fs.readFile(tempPdfPath);
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const finalPdfBytes = await mergedPdf.save();
        await fs.writeFile(outputPath, finalPdfBytes);

        for (const tempPdfPath of tempPdfPaths) {
            await fs.unlink(tempPdfPath);
        }
    } catch (error) {
        console.error('Error generating the PDF:', error);
        throw error;
    }
};

// Si se ejecuta desde la línea de comandos
if (require.main === module) {
    const args = process.argv.slice(2);
    const htmlFilePath = args[0];
    const outputPath = args[1];
    const jsonData = JSON.parse(args[2]);

    generatePDF(htmlFilePath, outputPath, jsonData)
        .then(() => console.log('PDF generado exitosamente.'))
        .catch((err) => console.error('Error al generar el PDF:', err));
}

module.exports = { generatePDF };
