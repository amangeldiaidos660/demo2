document.addEventListener('DOMContentLoaded', function() {
  var localFilePath = '../combined_file.xml';

  function readLocalFile(filePath) {
      return new Promise((resolve, reject) => {
          fetch(filePath)
              .then(response => response.text())
              .then(data => {
                  resolve(data);
              })
              .catch(error => {
                  reject(error);
              });
      });
  }

  readLocalFile(localFilePath)
      .then(xmlData => {
          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(xmlData, 'text/xml');
          var categoriesNode = xmlDoc.getElementsByTagName('categories')[0];
          var categoryNodes = categoriesNode.getElementsByTagName('category');
          var selectElement = document.querySelector('.category-list');
          for (var i = 0; i < categoryNodes.length; i++) {
              var categoryId = categoryNodes[i].getAttribute('id');
              var categoryName = categoryNodes[i].textContent;
              var optionElement = document.createElement('option');
              optionElement.value = categoryId;
              optionElement.textContent = categoryName;
              selectElement.appendChild(optionElement);
          }

          var offersNode = xmlDoc.getElementsByTagName('offer');
          var catalogElement = document.querySelector('.catalog');
          var itemsPerPage = 12;
          var currentPage = 1;

          function getProductDescription(offer) {
            var descriptionElement = offer.querySelector('description');
            if (descriptionElement) {
                return descriptionElement.textContent;
            } else {
                return 'Описание отсутствует';
            }
        }
        
        function getProductWarranty(offer) {
            var warrantyElement = offer.querySelector('Param[name="Гарантия"]');
            if (warrantyElement) {
                return warrantyElement.textContent;
            } else {
                return 'Гарантия отсутствует';
            }
        }
        
        function getProductPrice(offer) {
          var pricesElement = offer.querySelector('prices');
          var dealerPriceElement = pricesElement.querySelector('price[type="Дилерская цена"]');
          var rrpPriceElement = pricesElement.querySelector('price[type="RRP"]');
          var dealerPrice = dealerPriceElement ? dealerPriceElement.textContent : 'Цена не указана';
          var rrpPrice = rrpPriceElement ? rrpPriceElement.textContent : 'Цена не указана';
      
          return {
              dealerPrice: dealerPrice,
              rrpPrice: rrpPrice
          };
      }
      
      
        

          function showItemsOnPage(page) {
            catalogElement.innerHTML = '';
        
            var startIndex = (page - 1) * itemsPerPage;
            var endIndex = startIndex + itemsPerPage;
        
            for (var i = startIndex; i < endIndex && i < offersNode.length; i++) {
                var offer = offersNode[i];
                var productName = offer.querySelector('name').textContent;
                var productImage = offer.querySelector('picture').textContent;
                var productType = offer.getAttribute('type');
                var allPrices = getProductPrice(offer);

                var queryParams = '&dealerPrice=' + encodeURIComponent(allPrices.dealerPrice) + 
                                  '&rrpPrice=' + encodeURIComponent(allPrices.rrpPrice);
                
                var productUrl = 'single.html?' + 
                                 'title=' + encodeURIComponent(productName) + 
                                 '&category=' + encodeURIComponent(productType) + 
                                 '&description=' + encodeURIComponent(getProductDescription(offer)) + 
                                 '&article=' + encodeURIComponent(offer.getAttribute('article')) + 
                                 '&warranty=' + encodeURIComponent(getProductWarranty(offer)) + 
                                 queryParams +
                                 '&image=' + encodeURIComponent(productImage);
                
        
                var productDiv = document.createElement('div');
                productDiv.className = 'col-sm-12 col-md-4 col-lg-4 item';
                productDiv.innerHTML = `
                    <div class="product-item bg-light">
                        <div class="card">
                            <div class="thumb-content">
                                <a href="${productUrl}">
                                    <img class="card-img-top img-fluid" src="${productImage}" alt="${productName}">
                                </a>
                            </div>
                            <div class="card-body">
                                <h4 class="card-title"><a href="${productUrl}">${productName}</a></h4>
                                <ul class="list-inline product-meta">
                                    <li class="list-inline-item">
                                        <a href="${productUrl}">${productType}</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
        
                catalogElement.appendChild(productDiv);
            }
        }
        

          showItemsOnPage(currentPage);

          document.getElementById('prevPageButton').addEventListener('click', function() {
              if (currentPage > 1) {
                  currentPage--;
                  showItemsOnPage(currentPage);
                  document.getElementById('currentPage').textContent = currentPage;
              }
          });

          document.getElementById('nextPageButton').addEventListener('click', function() {
              var totalPages = Math.ceil(offersNode.length / itemsPerPage);
              if (currentPage < totalPages) {
                  currentPage++;
                  showItemsOnPage(currentPage);
                  document.getElementById('currentPage').textContent = currentPage;
              }
          });

          var searchForm = document.querySelector('form');
          var nameInput = document.getElementById('inputtext4');
          var categorySelect = document.querySelector('.category-list');

          searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
        
            var searchValue = nameInput.value.trim().toLowerCase();
            var categoryValue = categorySelect.value.toLowerCase(); 
        
            var filteredItems = [];
        
            for (var i = 0; i < offersNode.length; i++) {
                var offerNode = offersNode[i];
                var productName = offerNode.querySelector('name').textContent.toLowerCase();
                var productType = offerNode.getAttribute('type').toLowerCase(); 
                var productTypeLowerCase = productType.toLowerCase();
        
                if ((searchValue && productName.includes(searchValue)) || (!searchValue && (!categoryValue || productTypeLowerCase === categoryValue))) {
                    filteredItems.push(offerNode);
                }
            }
        
            showFilteredItems(filteredItems);
        });
        

          function showFilteredItems(filteredItems) {
          catalogElement.innerHTML = ''; 

          for (var i = 0; i < filteredItems.length; i++) {
              var offer = filteredItems[i];
              var productName = offer.querySelector('name').textContent;
              var productImage = offer.querySelector('picture').textContent;
              var productType = offer.getAttribute('type'); 

              var productDiv = document.createElement('div');
              productDiv.className = 'col-sm-12 col-md-4 col-lg-4 item';
              productDiv.innerHTML = `
                  <div class="product-item bg-light">
                      <div class="card">
                          <div class="thumb-content">
                              <a href="single.html">
                                  <img class="card-img-top img-fluid" src="${productImage}" alt="${productName}">
                              </a>
                          </div>
                          <div class="card-body">
                              <h4 class="card-title"><a href="single.html">${productName}</a></h4>
                              <ul class="list-inline product-meta">
                                  <li class="list-inline-item">
                                      <a href="single.html">${productType}</a>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>
              `;

              catalogElement.appendChild(productDiv);
          }
      }
      


      })
      .catch(error => {
          console.error('Ошибка при чтении файла:', error);
      });
      (function ($) {
        'use strict';
      
       
        if ($(window).width() < 992) {
          $('.navigation .dropdown-toggle').on('click', function () {
            $(this).siblings('.dropdown-menu').animate({
              height: 'toggle'
            }, 300);
          });
        }
      
        function counter() {
          var oTop;
          if ($('.counter').length !== 0) {
            oTop = $('.counter').offset().top - window.innerHeight;
          }
          if ($(window).scrollTop() > oTop) {
            $('.counter').each(function () {
              var $this = $(this),
                countTo = $this.attr('data-count');
              $({
                countNum: $this.text()
              }).animate({
                countNum: countTo
              }, {
                duration: 1000,
                easing: 'swing',
                step: function () {
                  $this.text(Math.floor(this.countNum));
                },
                complete: function () {
                  $this.text(this.countNum);
                }
              });
            });
          }
        }
        $(window).on('scroll', function () {
          counter();
          var scrollToTop = $('.scroll-top-to'),
            scroll = $(window).scrollTop();
          if (scroll >= 200) {
            scrollToTop.fadeIn(200);
          } else {
            scrollToTop.fadeOut(100);
          }
        });
        
        $('.scroll-top-to').on('click', function () {
          $('body,html').animate({
            scrollTop: 0
          }, 500);
          return false;
        });
          
      
      
        $('.trending-ads-slide').slick({
          dots: false,
          arrows: false,
          slidesToShow: 3,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 800,
          responsive: [{
            breakpoint: 1024,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1,
              infinite: true,
              dots: false
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
      
          ]
        });
      
      
      
        
      
      
      
      
        $(function () {
          $('[data-toggle="tooltip"]').tooltip();
        });
      
      
        $('.range-track').slider({});
        $('.range-track').on('slide', function (slideEvt) {
          $('.value').text('$' + slideEvt.value[0] + ' - ' + '$' + slideEvt.value[1]);
        });
      
      
      })(jQuery);

});

