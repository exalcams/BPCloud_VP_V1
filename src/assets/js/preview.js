


/**
 * Extract the test from the PDF
 */

function getTxtFrmPdf(url, invoicenum) {
    var x, y;
    var totalPages_result
    return pdfjsLib.getDocument(url).promise.then(function (PDFDocumentInstance) {

        totalPages = PDFDocumentInstance.numPages;
        var pageNumber = 1;
        // console.log(totalPages);


        return PDFDocumentInstance.getPage(pageNumber).then(function (pdfPage) {

            return pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var finalString = "";


                for (var i = 0; i < textItems.length; i++) {
                    var item = textItems[i];

                    finalString += item.str + " ";

                    // var n=   item.str.search("InvoiceNumber:123456");


                }
                //search word
                x = 0, y = 0;
                var text = finalString;
                var word = invoicenum
                for (i = 0; i < text.length; i++) {
                    // console.log("text:", text[i], "word", word[0]);
                    if (text[i] == word[0]) {
                        for (j = i; j < i + word.length; j++) {
                            // console.log(text[j] == word[j - i]);
                            if (text[j] == word[j - i]) {
                                y++;
                            }
                            if (y == word.length) {
                                x++;
                            }
                        }
                        y = 0;
                    }
                }
                // console.log("y", y);
                // console.log("x", x);
                //end

                // console.log("n",n);
                totalPages_result = finalString;



            });


        });

    }
    ).then(() => {

        return x;
    })
}





