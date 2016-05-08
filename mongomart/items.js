/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;
	
	/*
	* LAB #1A: 
	* Create an aggregation query to return the total number of items in each category. The
	* documents in the array output by your aggregation should contain fields for 
	* "_id" and "num". HINT: Test your mongodb query in the shell first before implementing 
	* it in JavaScript.
	*
	* Ensure categories are organized in alphabetical order before passing to the callback.
	*
	* 
	* @author: Harman Singh
	*/
    this.getCategories = function(callback) {
        "use strict";
        
		var categories = []
		//Get categories
        this.db.collection('item').aggregate([ {$group : { _id : "$category", num : {$sum : 1} }}, {$sort : {_id : 1}} ]).toArray(function(err, docs){
            assert.equal(err, null);
            assert.notEqual(docs.length, 0);
            
            var total = 0;
            
            docs.forEach(function(doc){
            	//sum total to add All category at the end
            	total += doc.num;
            	categories.push(doc)
            });

        
	        var all = {
    	        _id: "All",
        	    num: total
	        };
	        
	        categories.push(all);
    
	        callback(categories);
        })
    }

	/*
	 * LAB #1B: 
	 * Create a query to select only the items that should be displayed for a particular
	 * page. For example, on the first page, only the first itemsPerPage should be displayed. 
	 * Use limit() and skip() and the method parameters: page and itemsPerPage to identify 
	 * the appropriate products. Pass these items to the callback function. 
	 *
	 * Do NOT sort items. 
	 *@author: Harman Singh
	 */
    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";
        
        var query;
         var pageItems = [];
         if (category == "All"){
            query = {};
         } else {
            query = {"category": category };
         }

        this.db.collection('item').find(query).skip(page * itemsPerPage).limit(itemsPerPage).toArray(function(err, docs){
            for (var i = 0; i < docs.length; i++) {
                pageItems.push(docs[i]);
            }
            callback(pageItems);
        });

        
    }

	/*
	 * LAB #1C: Write a query that determines the number of items in a category and pass the
	 * count to the callback function. The count is used in the mongomart application for
	 * pagination. The category is passed as a parameter to this method.
	 *
	 * See the route handler for the root path (i.e. "/") for an example of a call to the
	 * getNumItems() method.
	 *
	 * @author: Harman Singh
	 */
    this.getNumItems = function(category, callback) {
        "use strict";
        
        var numItems = 0;

		var query = {};
		if (!category.match('All')){
			query = {category: category};
		}
		
        this.db.collection('item').find(query).count(function(err, count){
            
            callback(count);

         });
    }

	/*
	 * LAB #2A: Using the value of the query parameter passed to this method, perform
	 * a text search against the item collection. Do not sort the results. Select only 
	 * the items that should be displayed for a particular page. For example, on the 
	 * first page, only the first itemsPerPage matching the query should be displayed. 
	 * Use limit() and skip() and the method parameters: page and itemsPerPage to 
	 * select the appropriate matching products. Pass these items to the callback 
	 * function. 
	 *
	 * You will need to create a single text index on title, slogan, and description.
	 * 
	 * @author Harman Singh
	 */
    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";
        
        this.db.collection('item').find({ $text: { $search: query } } ).skip(page * itemsPerPage).limit(itemsPerPage).forEach(function(item){
			pageItems.push(item);
		 });
		 callback(pageItems);
    }

	/*
	* LAB #2B: Using the value of the query parameter passed to this method, count the
	* number of items in the "item" collection matching a text search. Pass the count
	* to the callback function.
	*
	* @author: Harman Singh
	*/
    this.getNumSearchItems = function(query, callback) {
        "use strict";
        this.db.collection('item').find({$text: {$search: query}}).count(function(err, count){
			if(!err){
				callback(count);
			}
		});
    }

	/*
	 * LAB #3: Query the "item" collection by _id and pass the matching item
	 * to the callback function.
	 *
	 * @author: Harman Singh
	 */
    this.getItem = function(itemId, callback) {
        "use strict";
		this.db.collection('item').findOne({_id: itemId}, function(err, item){
			if (!err){callback(item);}
		});
    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };

	/*
	 * LAB #4: Add a review to an item document. Reviews are stored as an 
	 * array value for the key "reviews". Each review has the fields: "name", "comment", 
	 * "stars", and "date".
	 *
	 * @author: Harman Singh
	 */
    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";
        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }

        //var dummyItem = this.createDummyItem();
        //dummyItem.reviews = [reviewDoc];
        
		this.db.collection('item').update({_id: itemId}, {$push: {reviews:reviewDoc}}, {}, function(err, results){
			assert.equal(null, err);
			callback(results);
		});
    }

	/*
	 * Test data used only for testing.
	 *
	 */
    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
