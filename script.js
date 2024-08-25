// G2303185D
// Wang Xiao
// https://github.com/Amanda-WangXiao/Swap-Page-Demo.git

$(document).ready(function () {
    const connectWalletBtn = $('#connectWallet');
    const swapButton = $('.swap-form button:contains("Connect wallet")');
    const ethBalanceElement = $('#ethBalance');
    const walletAddressContainer = $('#walletAddressContainer');
    const walletAddressShort = $('#walletAddressShort');
    const fullWalletAddress = $('#fullWalletAddress');
    const disconnectWallet = $('#disconnectWallet');
    let web3;
    let userAddress;

    $('#tokenDropdown, #swapToDropdown').each(function() {
        const $dropdown = $(this);
        $dropdown.next('.dropdown-menu').find('.dropdown-item').on('click', function(e) {
          e.preventDefault();
          const selectedToken = $(this).text();
          $dropdown.text(selectedToken);
        });
      });

    function handleEthereum() {
        const { ethereum } = window;
        if (ethereum && ethereum.isMetaMask) {
            console.log('Ethereum successfully detected!');
            setupEthereumDapp(ethereum);
        } else {
            console.log('MetaMask not detected!');
            alert('MetaMask is not detected. Please install MetaMask to use this feature.');
        }
    }

    function setupEthereumDapp(ethereum) {
        connectWalletBtn.click(() => connectWallet(ethereum));
        swapButton.click(() => connectWallet(ethereum));
        disconnectWallet.click(() => disconnectWalletHandler());
    }

    async function connectWallet(ethereum) {
        console.log("Attempting to connect wallet...");
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(ethereum);
            userAddress = accounts[0];

            console.log("User address:", userAddress);
            
            const balance = await web3.eth.getBalance(userAddress);
            const ethBalance = web3.utils.fromWei(balance, 'ether');
            console.log("ETH balance:", ethBalance);
            
            ethBalanceElement.text(`${parseFloat(ethBalance).toFixed(4)} ETH available to swap`);
            
            connectWalletBtn.hide();
            swapButton.text('Get Quotes');
            swapButton.prop('disabled', false);

            // Update wallet address dropdown
            walletAddressShort.text(truncateAddress(userAddress));
            fullWalletAddress.text(userAddress);
            walletAddressContainer.show();

            console.log('Wallet connected successfully');
        } catch (error) {
            console.error('Error connecting to wallet:', error);
            alert('Failed to connect to wallet. Please try again and ensure MetaMask is unlocked.');
        }
    }

    function disconnectWalletHandler() {
        userAddress = null;
        walletAddressContainer.hide();
        connectWalletBtn.show();
        connectWalletBtn.text('Connect Wallet');
        connectWalletBtn.prop('disabled', false);
        swapButton.text('Connect wallet');
        swapButton.prop('disabled', true);
        ethBalanceElement.text('0 ETH available to swap');
    }

    function truncateAddress(address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    // Check if Ethereum object is already available
    if (typeof window.ethereum !== 'undefined') {
        handleEthereum();
    } else {
        window.addEventListener('ethereum#initialized', handleEthereum, {
            once: true,
        });

        setTimeout(handleEthereum, 3000); // 3 seconds
    }

    $('#moveCrLink').on('click', function (e) {
        e.preventDefault();
        console.log("Move cr... clicked");
        $('#moveCrSubmenu').toggleClass('submenu-active');
        console.log("Submenu toggle class applied");
    });

    $('.submenu-item').on('click', function (e) {
        e.preventDefault();
        console.log("Clicked on: " + $(this).text().trim());
        $('#moveCrSubmenu').removeClass('submenu-active');
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('#moveCrLink, #moveCrSubmenu').length) {
            $('#moveCrSubmenu').removeClass('submenu-active');
        }
    });

    if (window.ethereum) {
        window.ethereum.on('chainChanged', function (chainId) {
            console.log('Network changed to:', chainId);
            window.location.reload();
        });
    }

    if (window.ethereum) {
        window.ethereum.on('accountsChanged', function (accounts) {
            if (accounts.length === 0) {
                console.log('User disconnected wallet');
                disconnectWalletHandler();
            } else {
                console.log('User switched to account:', accounts[0]);
                connectWallet(window.ethereum);
            }
        });
    }

    console.log("Script loaded and ready");
});