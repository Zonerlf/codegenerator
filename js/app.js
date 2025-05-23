// Guardar y cargar el folio
function loadFolio() {
    const storedFolio = localStorage.getItem('folio');
    return storedFolio ? parseInt(storedFolio, 10) : 1;
}

function saveFolio(folio) {
    localStorage.setItem('folio', folio);
}

// Procesar archivo de entrada
document.querySelector('#file-input').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const fileData = e.target.result;
        let data;
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'xlsx' || ext === 'xls') {
            data = XLSX.read(fileData, { type: 'binary' });
            const sheet = data.Sheets[data.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            populateTable(jsonData);
        }
    };
    reader.readAsBinaryString(file);
}

function populateTable(data) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';  
    let folio = loadFolio();
    const rows = data.slice(1);

    rows.forEach((row) => {
        const barcodeData = row[0];
        const barcodeText = `${row[0]} - ${row[1]}`;
        const barcodeCanvas = document.createElement('canvas');
        barcodeCanvas.classList.add('barcode-canvas');

        JsBarcode(barcodeCanvas, barcodeData, {
            format: "CODE128",
            displayValue: true,
            text: barcodeText,
            lineColor: "#000",
            width: 2,
            height: 50
        });

        const qrData = {
            code: row[0],
            description: row[1],
            date: formatDate(row[2]), 
            invoice: row[3],
            oc: row[4],
            register: row[5],
            provider: row[6],
            client: row[7],
            folio: folio++
        };

        const qrCodeCanvas = document.createElement('canvas');
        qrCodeCanvas.classList.add('qr-canvas');
        QRCode.toCanvas(qrCodeCanvas, JSON.stringify(qrData), (error) => {
            if (error) console.error(error);
        });

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row[0]}</td>
            <td>${row[1]}</td>
            <td>${formatDate(row[2])}</td>
            <td>${row[3]}</td>
            <td>${row[4]}</td>
            <td>${row[5]}</td>
            <td>${row[6]}</td>
            <td>${row[7]}</td>
        `;

        var barcodeTd = document.createElement('td');
        barcodeTd.appendChild(barcodeCanvas);
        tr.appendChild(barcodeTd);

        var qrTd = document.createElement('td');
        qrTd.appendChild(qrCodeCanvas);
        tr.appendChild(qrTd);

        tableBody.appendChild(tr);
    });

    saveFolio(folio);
}

// Función para formatear la fecha en formato dd/mm/yyyy
function formatDate(date) {
    const parsedDate = new Date(Date.UTC(0, 0, date - 1));
    if (!isNaN(parsedDate.getTime())) {
        // Extraemos el día, mes y año
        const day = parsedDate.getUTCDate().toString().padStart(2, '0');
        const month = (parsedDate.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = parsedDate.getUTCFullYear();
        return `${day}/${month}/${year}`;
    }

    return date; // Si no es una fecha válida, retornamos tal cual
}

// Generar todos los códigos cuando se hace clic en el botón
document.querySelector('#generate-all-codes-btn').addEventListener('click', generateAllBarcodes);

function generateAllBarcodes() {
    const rows = document.querySelectorAll('#data-table tbody tr');
    rows.forEach((row, index) => {
        const barcodeData = row.children[0].innerText;

        let barcodeCanvas = row.querySelector('canvas');
        if (!barcodeCanvas) {
            barcodeCanvas = document.createElement('canvas');
            row.children[row.children.length - 1].appendChild(barcodeCanvas);
        }

        JsBarcode(barcodeCanvas, barcodeData, {
            format: "CGS1-128",
            displayValue: true,
            lineColor: "#000",
            width: 2,
            height: 50
        });

        const qrData = {
            code: row.children[0].innerText,
            description: row.children[1].innerText,
            date: row.children[2].innerText,
            invoice: row.children[3].innerText,
            oc: row.children[4].innerText,
            register: row.children[5].innerText,
            provider: row.children[6].innerText,
            client: row.children[7].innerText,
            folio: loadFolio() + index + 1
        };

        const qrCodeCanvas = row.querySelector('canvas');
        if (qrCodeCanvas) {
            QRCode.toCanvas(qrCodeCanvas, JSON.stringify(qrData), (error) => {
                if (error) console.error(error);
            });
        }
    });
}

// Exportar tabla a archivo XLS
document.querySelector('#export-btn').addEventListener('click', exportToXLS);

function exportToXLS() {
    const table = document.querySelector('#data-table');
    const wb = XLSX.utils.table_to_book(table, {
        raw: true,
        cellStyles: true,
        sheetColWidth: [20, 30, 15, 15, 15, 15, 20, 20, 25, 25] // Ajusta valores
    });
    XLSX.writeFile(wb, 'codigos.xlsx');
}

// Imprimir códigos de barras
document.querySelector('#print-barcode-btn').addEventListener('click', printBarcodes);

function printBarcodes() {
    const rows = document.querySelectorAll('#data-table tbody tr');
    const barcodeData = [];

    rows.forEach((row) => {
        const barcodeCanvas = row.querySelector('.barcode-canvas');
        const code = row.children[0].innerText;
        const date = row.children[2].innerText;
        const url = row.children[6].innerText;
        if (barcodeCanvas) {
            const barcodeImage = barcodeCanvas.toDataURL('image/png');
            barcodeData.push({ image: barcodeImage, code: code, date: date, url: url });
        }
    });

    if (barcodeData.length > 0) {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Impresión de Códigos de Barras</title>');
        // Modificador de pagina y contenedor de códigos
        printWindow.document.write(`
            <style>
                @media print {
                    @page {
                        margin: 0; /* Aseguramos que no haya margen de la impresora */
                    }
                    body { font-family: Arial, sans-serif; margin: 0; }
                    .page { 
                        display: grid; 
                        grid-template-columns: repeat(3, 7.8cm); 
                        grid-template-rows: repeat(10, 2.9cm); 
                        column-gap: 6mm;
                        row-gap: 0mm;
                        width: 21.59cm;
                        height: 27.94cm;
                        page-break-after: always; 
                        padding: 15mm 3mm; 
                        box-sizing: border-box; 
                    }
                    .barcode-container { 
                        display: flex; 
                        flex-direction: column; 
                        justify-content: center; 
                        align-items: center; 
                        border: 1px solid #ccc; 
                        padding: 0; 
                        margin: 2mm; 
                        height: 2.9cm; 
                        width: 7.8cm; 
                    }
                    img { 
                        width: 92%; 
                        height: auto; 
                    }
                    .barcode-code { 
                        font-size: 4px; 
                        text-align: center; 
                        margin-top: 3px; 
                    }
                }
            </style>
        `);
        printWindow.document.write('</head><body>');

        const barcodesPerPage = 30;
        for (let i = 0; i < barcodeData.length; i += barcodesPerPage) {
            const pageBarcodeData = barcodeData.slice(i, i + barcodesPerPage);
            printWindow.document.write('<div class="page">');
            pageBarcodeData.forEach((barcode) => {
                printWindow.document.write(`
                    <div class="barcode-container">
                        <img src="${barcode.image}" alt="Código de Barras">
                        <div class="barcode-code" style="font-size: small">${barcode.date}</div>
                    </div>
                `);
            });
            printWindow.document.write('</div>');
        }

        printWindow.document.write('</body></html>');
        printWindow.document.close();

        printWindow.onload = function () {
            printWindow.print();
            printWindow.close();
        };
    } else {
        alert('No se encontraron códigos de barras para imprimir.');
    }
}

// Imprimir códigos QR
document.querySelector('#print-qr-btn').addEventListener('click', printQRs);

function printQRs() {
    const rows = document.querySelectorAll('#data-table tbody tr');
    const qrData = []; // Almacenará las imágenes base64 de los QR y sus identificadores

    // Recopilar los canvas generados para los QR y sus identificadores
    rows.forEach((row) => {
        const qrCodeCanvas = row.querySelector('.qr-canvas');
        const code = row.children[0].innerText; // Obtener el valor de la primera columna (código)
        const description = row.children[1].innerText; // Obtener la descripción
        const date = row.children[2].innerText;
        const provider = row.children[6].innerText;
        if (qrCodeCanvas) {
            // Convertir el canvas a una imagen base64
            const qrImage = qrCodeCanvas.toDataURL('image/png');
            qrData.push({ image: qrImage, code: code, description: description, date: date, provider: provider }); // Guardar la imagen y los datos
        }
    });

    // Verificamos si hay QR para imprimir
    if (qrData.length > 0) {
        // Creamos una ventana para la impresión
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Impresión de Códigos QR</title>');
        printWindow.document.write(`
            <style>
                @media print {
                    @page {
                        margin: 0;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                    }
                    .page {
                        display: grid;
                        grid-template-columns: repeat(2, 10.1cm);
                        grid-template-rows: repeat(3, 8.4cm);
                        column-gap: 6mm;
                        row-gap: 0mm;
                        width: 21.6cm;
                        height: 27.9cm;
                        page-break-after: always;
                        padding: 15mm 3mm;
                        box-sizing: border-box;
                    }
                    .qr-container {
                        display: flex;
                        border: 1px solid #ccc;
                        padding: 0;
                        margin: 0;
                        height: 8.4cm;
                        width: 10.1cm;
                        box-sizing: border-box;
                    }
                    .qr-left {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        width: 10cm;
                        height: 8cm;
                        padding: 3mm;
                        box-sizing: border-box;
                    }
                    .qr-right {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        padding: 3mm;
                        width: 70%;
                        height: 100%;
                    }
                    img {
                        height: 87%;
                        width: auto;
                        object-fit: contain;
                        border: none;
                    }
                    .data {
                        font-size: 15px;
                        text-align: left;
                        line-height: 1.2;
                    }
                }
            </style>
        `);
        printWindow.document.write('</head><body>');

        // Dividir los QR en páginas de 40 (4x10)
        const qrPerPage = 6; // 4 columnas × 10 filas
        for (let i = 0; i < qrData.length; i += qrPerPage) {
            const pageQrData = qrData.slice(i, i + qrPerPage); // QR para esta página

            // Crear una página con una cuadrícula de 4x10
            printWindow.document.write('<div class="page">');
            pageQrData.forEach((qr) => {
                printWindow.document.write(`
                    <div class="qr-container">
                        <div class="qr-left">
                            <img src="${qr.image}" alt="Código QR">
                        </div>
                        <br>
                        <div class="qr-right">
                            <div class="data" style="font-size 18px"><strong>Código: </strong>${qr.code}</div>
                            <div class="data" style="font-size 18px"><strong>Descripción: </strong>${qr.description}</div>
                            <div class="data" style="font-size 18px"><strong>Fecha: </strong>${qr.date}</div>
                            <div class="data" style="font-size 18px"><strong>Proveedor: </strong>${qr.provider}</div>
                        </div>
                    </div>
                `);
            });
            printWindow.document.write('</div>'); // Cerrar la página
        }

        printWindow.document.write('</body></html>');
        printWindow.document.close();

        // Esperamos que el contenido se cargue antes de imprimir
        printWindow.onload = function () {
            printWindow.print();
            printWindow.close();
        };
    } else {
        alert('No se encontraron códigos QR para imprimir.');
    }
}