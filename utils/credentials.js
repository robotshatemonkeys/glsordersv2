const prod='http://nodejs-mongo-persistent-blak-gls.1d35.starter-us-east-1.openshiftapps.com/',
			dev='http://0.0.0.0:8080/';

module.exports = {
	oauth: {
		shopify_api_key: '9f3dc823496745120efebe466e15a44c', // Your API key
		shopify_shared_secret: '312594f20fe6b4d3ac0a4a817442c37e', // Your Shared Secret
		shopify_scope: 'read_orders,write_orders',
    redirect_uri:'install/finish_auth',
		nonce: '' // you must provide a randomly selected value unique for each authorization request
	},
	path:{
		prod:prod,
		dev:dev
	},
	crashmail:{
		mailEnabled: true,
	  mailTransportName: 'SMTP',
	  mailTransportConfig: {
	      service: 'Gmail',
	      auth: {
	          user: "rhmcrashsender@gmail.com",
	          pass: "federicorhm"
	      }
	  },
	  mailSubject: 'advanced.js crashreporter test',
	  mailFrom: 'crashreporter <crivellarofederico@gmail.com>',
	  mailTo: 'info@robotshatemonkeys.com'
	},
	webhooks:[
		{
			"webhook": {
		    "topic": "app/uninstalled",
		    "address": prod+'install/delete',
		    "format": "json"
		  }
	  }
	]
}
