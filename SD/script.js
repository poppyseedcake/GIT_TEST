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
    // Zakładamy, że masz już bazę linków w zmiennej "results"
    // Przykładowo:
    // const results = [
    //   { href: 'https://secretdelivery.pl/amorelie', title: 'Amorelie' },
    //   { href: 'https://secretdelivery.pl/inny-link', title: 'Inny Link' }
    // ];
  
    // Funkcja pobierająca szczegóły pojedynczego produktu na podstawie jego URL
    async function getProductDetails(productUrl) {
      try {
        const response = await fetch(productUrl);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
  
        // Pobiera elementy: link z nazwą marki oraz span z nazwą produktu
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
  
    // Funkcja pobierająca produkty ze strony z listą produktów i obsługująca paginację
    async function getProductsFromListing(listingUrl) {
      let allProductsDetails = [];
      let currentPageUrl = listingUrl;
      let hasNextPage = true;
  
      while (hasNextPage) {
        try {
          console.log(`Pobieranie strony: ${currentPageUrl}`);
          const response = await fetch(currentPageUrl);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
  
          // Znajdź wszystkie linki do produktów (elementy <a> z klasą "product-image-link")
          const productLinkElements = doc.querySelectorAll('a.product-image-link');
          const productLinks = Array.from(productLinkElements).map(el => el.href);
  
          // Pętla sekwencyjna – każde zapytanie dla produktu jest wykonywane po kolei
          for (let link of productLinks) {
            const details = await getProductDetails(link);
            allProductsDetails.push(details);
          }
  
          // Sprawdzamy, czy istnieje przycisk "następna strona"
          // Jeśli element input o id "p-next-bottom" nie ma atrybutu disabled, to przechodzimy do kolejnej strony.
          const nextPageInput = doc.querySelector('input#p-next-bottom:not([disabled])');
  
          if (nextPageInput) {
            const nextPageNumber = nextPageInput.value; // np. "2", "3", itd.
            // Budujemy URL kolejnej strony. Jeśli URL początkowy nie posiada odpowiedniego parametru, dodajemy go.
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
  
    // Funkcja przetwarzająca każdy link z Twojej bazy 'results'
    async function processResults() {
      for (let item of results) {
        console.log(`\nPrzetwarzanie listy produktów z: ${item.href}`);
        const products = await getProductsFromListing(item.href);
        console.log(`Produkty pobrane ze strony ${item.href}:`, products);
        // Tutaj można zapisać lub przetworzyć pobrane dane
      }
    }
  
    // Rozpoczęcie przetwarzania
    processResults();
  })();