var ListPage = Object.assign(ListPage, {
	"model": {
        "URLParams": "",
        "params": {
            "current": {},
            /* {
                "s" : "", //globalSearch
                "ss" : "", //localSearch
                "subcategory" : "",
                "price" : startInr + ";" + endInr,
                "property" : [],
                "sort" : "",
                "page" : "" //pagination no
            } */
            "changes": {
                "add": {},
                "remove": {},
            },
            "page": {},
            "defaults": {}
        },
        // mode of tranferring valued from one component(M, V, C) to another.
        "clipboard": {
            "prevMinPrice": "",
            "prevMaxPrice": "",
            "slider": {},
            "prevLocalSearch": "",
            "pageType": "",
            "pageName" : "",
            "scroll": {
                "isAutoLoad": true,
                "isEnabled": true,
                "counter": 0,
                "isLoading": false,
                "isTrigger": false
            }
        }
    }
});