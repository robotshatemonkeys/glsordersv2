module.exports = {
	oauth: {
		shopify_api_key: '7251f2b8b19d4d9c144cf5c2bde03d40', // Your API key 
		shopify_shared_secret: '5f93df588305ffb23683a960781a625a', // Your Shared Secret 
		shopify_scope: 'read_orders',
    	redirect_uri:'install/finish_auth',
    	remove_uri:'install/delete',
		nonce: '' // you must provide a randomly selected value unique for each authorization request 
	},
	path:{
		prod:'http://shopifyprivateskeleton-01shopify.rhcloud.com/',
		dev:'http://localhost:3000/'
	}

}
      