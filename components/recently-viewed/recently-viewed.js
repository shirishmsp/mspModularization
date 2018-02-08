function storeProductInfo() {
    var url = document.URL;
    if (dataLayer[0].url !== undefined && (url.indexOf('-msp') > -1 || url.indexOf('-msf') > -1 || url.indexOf('products') > -1 || url.indexOf('-dealid') > -1)) {
        var productInfo = {
            title: dataLayer[0].title,
            image: dataLayer[0].image,
            price: dataLayer[0]["min-price"],
            url: dataLayer[0].url,
            mspid: dataLayer[0].mspid,
            productType: dataLayer[0]["product-type"],
            timeStamp: Date.now()
        }
        if (window.indexedDB) {
            var request = window.indexedDB.open("userDb", 1);
            request.onupgradeneeded = function(event) {
                var db = event.target.result;
                // Create an objectStore for this database
                if (!db.objectStoreNames.contains("recentlyViewed")) {
                    var objectStore = db.createObjectStore("recentlyViewed", { autoIncrement: true });
                    objectStore.createIndex("url", "url", { unique: true });
                    objectStore.createIndex("timeStamp", "timeStamp", { unique: false });
                }
            };
            request.onerror = function(event) {
                // Do something with request.errorCode!
                console.log("error on indexdb open");
            };
            request.onsuccess = function(event) {
                db = event.target.result;
                var transaction = db.transaction(["recentlyViewed"], "readwrite");
                var store = transaction.objectStore("recentlyViewed");
                var myIndex = store.index('url');
                var getKeyRequest = myIndex.getKey(productInfo.url);
                getKeyRequest.onsuccess = function(event) {
                    var key = getKeyRequest.result;
                    if (key === undefined) {
                        store.put(productInfo);
                    } else {
                        var getRequest = store.get(key);
                        getRequest.onsuccess = function(event) {
                            var oldPrice = getRequest.result.price;
                            var newPrice = productInfo.price;
                            var lastVisited = new Date(getRequest.result.timeStamp).toDateString();
                            if (lastVisited == new Date().toDateString()) {
                                lastVisited = '';
                            } else {
                                lastVisited = ' on ' + lastVisited;
                            }
                            if (oldPrice > newPrice && oldPrice != '0' && newPrice != '0') {
                                var priceDiff = ((oldPrice - newPrice) * 100 / oldPrice).toFixed(1);
                                var priceText = "Price dropped by " + priceDiff + "% since your last visit" + lastVisited;
                                var eventAction = 'Dropped';
                            } else if (oldPrice < newPrice && oldPrice != '0' && newPrice != '0') {
                                var priceDiff = ((newPrice - oldPrice) * 100 / oldPrice).toFixed(1);
                                var priceText = "Price increased by " + priceDiff + "% since your last visit" + lastVisited;
                                var eventAction = 'Increased';
                            } else if (oldPrice = newPrice && oldPrice != '0' && newPrice != '0') {
                                var priceDiff = 0;
                                var priceText = "Price remained same since your last visit" + lastVisited;
                                var eventAction = 'Remainedsame';
                            }
                            //disabled by mallik
                            if (false && priceText !== undefined) {
                                var priceDiffHtml = "<div class='prdct-dtl__str-ftrs'><span class='prdct-dtl__str-ftr prdct-dtl__str-ftr--hghlght'>" + priceText + "</span>  </div>";
                                $(".prdct-dtl__str-dtls").append(priceDiffHtml);
                                ga('send', 'event', 'pricetool', eventAction, getRequest.result.mspid, priceDiff);
                            }
                            store.put(productInfo, key);
                        }
                    }
                }
                var countRequest = store.count();
                countRequest.onsuccess = function() {
                    if (countRequest.result > 20) {
                        delCount = countRequest.result - 20;
                        store.index("timeStamp").openCursor().onsuccess = function(event) {
                            var cursor = event.target.result;
                            if (cursor && delCount > 0) {
                                delCount--;
                                console.log(delCount);
                                store.delete(cursor.primaryKey);
                                cursor.continue();
                            }
                        };
                    }
                }
            };
        }
    }
}

function fillRecentlyViewedSection() {
    var isDealPage = window.location.pathname === "/deals/" ? true : false;

    if (window.indexedDB) {
        var request = indexedDB.open("userDb", 1);
        request.onupgradeneeded = function(event) {
            var thisDB = event.target.result;

            // Create an objectStore for this database
            if (!thisDB.objectStoreNames.contains("recentlyViewed")) {
                var objectStore = thisDB.createObjectStore("recentlyViewed", { autoIncrement: true });
                objectStore.createIndex("url", "url", { unique: true });
                objectStore.createIndex("timeStamp", "timeStamp", { unique: false });
            }
        };
        request.onerror = function(event) {
            // Do something with request.errorCode!
            console.log("error on indexdb open");
        };
        request.onsuccess = function(event) {
            db = event.target.result;
            var transaction = db.transaction(["recentlyViewed"], "readonly");
            var objectStore = transaction.objectStore("recentlyViewed");
            var cursor = objectStore.index("timeStamp").openCursor(null, "prev");
            var startHtml = '<div class="sctn" id="rcntly_vwd" data-slideitem="prdct-item" data-slideitemwrprper="sctn__inr"><div class="sctn__hdr clearfix"><div class="sctn__ttl">You Recently Viewed</div><div class="sctn__nvgtn"></div></div><div class="sctn__inr prdct-grid clearfix">';
            var snippet = '<div class="prdct-item" data-mspid="--mspid--"><div class="prdct-item__save-btn js-save-btn"></div><a class="prdct-item__img-wrpr" href="--url--"><img class="prdct-item__img" src="https://assets.mspcdn.net/w_70/logos/mysmartprice/owl/lazy.png" data-lazy-src="--image--" alt="--alttitle--"></a><div class="prdct-item__dtls"><a class="prdct-item__name" href="--hrefurl--">--title--</a><div class="prdct-item__prc"><span class="prdct-item__rpe">--priceSym--</span><span class="prdct-item__prc-val">--price--</span></div></div></div>';
            var endHtml = '</div></div>';
            var rvCount = 0;
            cursor.onsuccess = function(e) {
                var res = e.target.result;
                console.log(res);
                if (rvCount == 5) {
                    res = null;
                }
                if (res) {
                    newSnippet = snippet;
                    var price = res.value.price,
                        productType = res.value.productType;

                    if ((isDealPage && productType == "deals") || (!isDealPage && productType != "deals")) {
                        price = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        var priceSym = '₹';
                        if (price == '0') {
                            var priceSym = '';
                            price = 'Not Available';
                        }
                        newSnippet = newSnippet.replace('--url--', res.value.url + '?ref=rv').replace('--title--', res.value.title).replace('--image--', res.value.image).replace('--price--', price).replace('--mspid--', res.value.mspid).replace('--alttitle--', res.value.title).replace('--hrefurl--', res.value.url).replace('--priceSym--', priceSym);
                        rvCount++;
                        startHtml += newSnippet;
                    }

                    res.continue();

                } else {
                    if (rvCount > 0) {
                        startHtml += endHtml;
                        if ($('.spnsr-cntnt').length) {
                            $('.spnsr-cntnt').before(startHtml);
                        } else {
                            $('.main-wrpr').append(startHtml);
                        }
                        lazyLoadImages();
                    }
                }
            }
        }
    }
}

// Function to store current viewed item to indexed db
storeProductInfo();

$(document).ready(function() {
    if (window.location.pathname == '/' || window.location.pathname == '/deals/') {
        fillRecentlyViewedSection();
    }
});