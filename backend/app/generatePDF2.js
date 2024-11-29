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

    // Reemplaza todas las variables del JSON en el template
    for (const key in data) {
        if (key === 'products') continue; // Ignorar 'products', lo procesamos por separado
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
                    <tr>
                        <td>${product.cantidad}</td>
                        <td>${product.producto}</td>
                        <td>${product.precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>${importe}</td>
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

// Genera un PDF único
const generatePDF = async (htmlFilePath, outputPath, jsonData) => {
    try {
        // Carga la plantilla HTML
        const htmlTemplate = await loadTemplate(htmlFilePath);

        // Inicia Puppeteer para generar el PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Rellena el HTML con los datos
        const filledHtml = replaceTemplate(htmlTemplate, jsonData);
        await page.setContent(filledHtml, { waitUntil: 'domcontentloaded' });

        // Genera el archivo PDF
        await page.pdf({
            path: outputPath,
            format: 'letter',
            printBackground: true,
        });

        // Cierra el navegador
        await browser.close();

        console.log('PDF generado exitosamente.');
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        throw error;
    }
};

// Si se ejecuta desde la línea de comandos
if (require.main === module) {
    const args = process.argv.slice(2); // Argumentos: [htmlFilePath, outputPath, jsonData]
    const htmlFilePath = args[0];
    const outputPath = args[1];
    const jsonData = JSON.parse(args[2]);

    generatePDF(htmlFilePath, outputPath, jsonData)
        .then(() => console.log('PDF generado exitosamente.'))
        .catch((err) => console.error('Error al generar el PDF:', err));
}

module.exports = { generatePDF };
