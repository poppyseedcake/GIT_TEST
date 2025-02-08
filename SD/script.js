// Pobierz wszystkie divy z określonymi klasami
const divs = document.querySelectorAll('div.acris-az-listing-list-names.acris-manufacturer');

// Przekształć NodeList w tablicę i mapuj dane
const results = Array.from(divs).map(div => {
  const link = div.querySelector('a');
  return {
    href: link.href,
    title: link.title
  };
});

// Wyświetl wyniki w konsoli
console.log(results);


(async function () {
    // Flaga do zatrzymywania wykonywania skryptu (możesz wywołać stopScript() z konsoli)
    let stopExecution = false;
    window.stopScript = () => {
      stopExecution = true;
      console.log('Zatrzymano wykonywanie skryptu.');
    };
  
    // Funkcja pomocnicza do prawidłowego eskapowania wartości CSV
    function escapeCSV(value) {
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return '"' + value.replace(/"/g, '""') + '"';
      }
      return value;
    }
  
    // Funkcja inicjująca pobranie pliku CSV
    function downloadCSV(csvContent, filename) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  
    // Przykładowa baza linków (zmienna results)
    // const results = [
    //   { href: 'https://secretdelivery.pl/amorelie', title: 'Amorelie' },
    //   { href: 'https://secretdelivery.pl/inny-link', title: 'Inny Link' }
    // ];
  
    // Funkcja pobierająca szczegóły pojedynczego produktu na podstawie jego URL
    async function getProductDetails(productUrl) {
      if (stopExecution) return null;
      try {
        const response = await fetch(productUrl);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
  
        // Wyszukaj element z nazwą firmy (marki) oraz nazwą produktu
        const brandElement = doc.querySelector('a.product-detail-manufacturer-link');
        const productNameElement = doc.querySelector('span.d-block');
  
        const brand = brandElement ? brandElement.textContent.trim() : 'Brak marki';
        const productName = productNameElement ? productNameElement.textContent.trim() : 'Brak nazwy produktu';
  
        return { productUrl, brand, productName };
      } catch (error) {
        console.error(`Błąd przy pobieraniu szczegółów produktu ${productUrl}:`, error);
        return { productUrl, brand: 'Błąd', productName: 'Błąd' };
      }
    }
  
    // Funkcja pobierająca produkty ze strony z listą produktów z obsługą paginacji
    async function getProductsFromListing(listingUrl) {
      let allProductsDetails = [];
      let currentPageUrl = listingUrl;
      let hasNextPage = true;
  
      while (hasNextPage && !stopExecution) {
        console.log(`Pobieranie strony: ${currentPageUrl}`);
        try {
          const response = await fetch(currentPageUrl);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
  
          // Pobierz linki do poszczególnych produktów (elementy <a> z klasą "product-image-link")
          const productLinkElements = doc.querySelectorAll('a.product-image-link');
          const productLinks = Array.from(productLinkElements).map(el => el.href);
  
          // Sekwencyjna pętla po linkach produktów
          for (let link of productLinks) {
            if (stopExecution) break;
            const details = await getProductDetails(link);
            if (details) allProductsDetails.push(details);
          }
  
          // Sprawdź, czy istnieje aktywny przycisk "następna strona"
          // Jeśli element input o id "p-next-bottom" nie ma atrybutu disabled, przechodzimy na kolejną stronę
          const nextPageInput = doc.querySelector('input#p-next-bottom:not([disabled])');
          if (nextPageInput) {
            const nextPageNumber = nextPageInput.value; // np. "2", "3", itd.
            const urlObj = new URL(listingUrl);
            urlObj.searchParams.set('p', nextPageNumber);
            currentPageUrl = urlObj.href;
          } else {
            hasNextPage = false;
          }
        } catch (error) {
          console.error(`Błąd przy pobieraniu listy produktów ze strony ${currentPageUrl}:`, error);
          hasNextPage = false;
        }
      }
  
      return allProductsDetails;
    }
  
    // Główna funkcja przetwarzająca kolejne strony z bazy 'results'
    async function processResults() {
      let csvRows = [];
      // Dodaj nagłówek CSV
      csvRows.push('Nazwa Firmy,Nazwa Produktu,Link do Produktu');
  
      for (let item of results) {
        if (stopExecution) break;
        console.log(`\nPrzetwarzanie listy produktów z: ${item.href}`);
        const products = await getProductsFromListing(item.href);
        console.log(`Produkty pobrane ze strony ${item.href}:`, products);
        // Dla każdego pobranego produktu dodajemy wiersz CSV
        for (let product of products) {
          const row = `${escapeCSV(product.brand)},${escapeCSV(product.productName)},${escapeCSV(product.productUrl)}`;
          csvRows.push(row);
        }
      }
      // Po zakończeniu przetwarzania łączymy wiersze i inicjujemy pobranie pliku CSV
      const csvContent = csvRows.join('\n');
      downloadCSV(csvContent, 'produkty.csv');
    }
  
    // Rozpoczęcie przetwarzania
    await processResults();
  })();