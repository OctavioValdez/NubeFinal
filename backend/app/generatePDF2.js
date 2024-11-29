const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const { PDFDocument } = require('pdf-lib');

// Cargamos el archivo HTML
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

        const products = jsonData.products || [];
        const maxProducts = 6;
        const productChunks = [];

        for (let i = 0; i < products.length; i += maxProducts) {
            productChunks.push(products.slice(i, i + maxProducts));
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            timeout: 60000,
        });

        const tempPdfPaths = [];

        for (let i = 0; i < productChunks.length; i++) {
            const page = await browser.newPage();
            const currentData = { ...jsonData, products: productChunks[i] };

            const filledHtml = replaceTemplate(htmlTemplate, currentData);

            // Depuración del contenido HTML
            await fs.writeFile('./debug.html', filledHtml);
            console.log('HTML guardado en debug.html para inspección');

            await page.setContent(filledHtml, {
                waitUntil: 'domcontentloaded',
                timeout: 60000, // Aumentar tiempo de espera
            });

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
    const jsonDataString = args[2];

    console.log("Argumentos recibidos:", { htmlFilePath, outputPath, jsonDataString });

    try {
        const jsonData = JSON.parse(jsonDataString);
        console.log("JSON Data parseado correctamente:", jsonData);

        generatePDF(htmlFilePath, outputPath, jsonData)
            .then(() => console.log("PDF generado exitosamente."))
            .catch((err) => {
                console.error("Error al generar el PDF:", err);
                process.exit(1);
            });
    } catch (err) {
        console.error("Error al parsear el JSON:", err);
        process.exit(1);
    }
}
