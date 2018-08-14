import Web3 from 'web3'

let getWeb3 = new Promise(function (resolve, reject) {
  window.addEventListener('load', function () {
    let results;
    let web3 = window.web3;

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider);

      results = {
        web3: web3
      };

      console.log('Injected web3 detected.');
      resolve(results)
    } else {
      let provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      web3 = new Web3(provider);

      results = {
        web3: web3
      };

      console.log('No web3 instance injected, using Local web3.');

      // should be resolve, leave reject for dev as there should always be metamask installed
      reject(results);
    }
  })
})

export default getWeb3;