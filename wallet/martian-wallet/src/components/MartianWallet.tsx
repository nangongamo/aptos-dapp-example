import React, { useEffect, useState } from "react";
import { Types, AptosClient } from 'aptos';
import Button from '@mui/material/Button';
import WalletIcon from '@mui/icons-material/Wallet';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { BigNumber } from "bignumber.js";
import copy from 'copy-to-clipboard';

const client = new AptosClient('https://fullnode.testnet.aptoslabs.com');

const TYPE_APTOS_COIN = '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>';

function MartianWallet() {
    const [connect, setConnect] = useState(false)
    const [network, setNetwork] = useState('');
    const [address, setAddress] = useState('');
    const [openTip, setOpenTip] = useState(false);
    const [tipMsg, setTipMsg] = useState('');
    const [apt, setApt] = useState('0');

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMenuItem = Boolean(anchorEl);

    window.martian.onAccountChange((addr: string) => {
        console.log("Changed address", addr);
        setAddress(addr);
    });

    window.martian.onNetworkChange((name: string) => {
        console.log(name);
        setNetwork(name);
    });

    const handleCloseTip = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenTip(false);
    };

    const handleDropMenu = async (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        await window.martian.connect();
        const isConnected = await window.martian.isConnected();
        const network = await window.martian.network();
        setConnect(true);
        setNetwork(network);
        if (isConnected) {
            const martianAccount = await window.martian.account();
            console.log(martianAccount);
            setAddress(martianAccount.address);
            // const transactions = await window.martian.getAccountResources(martianAccount.address);
            // console.log(transactions);
            const result: Types.MoveResource = await client.getAccountResource(martianAccount.address, TYPE_APTOS_COIN);
            let coin = (result.data) && (result.data as any)['coin'];
            let coinAmt = coin && (coin as any)['value'];
            setApt(new BigNumber(coinAmt).div(100000000).toString());
        }
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleCopyAddress = () => {
        copy(address);
        setOpenTip(true);
        setTipMsg('copied！');
        setAnchorEl(null);
    };

    const handleDisconnect = async () => {
        await window.martian.disconnect();
        setOpenTip(true);
        setConnect(false);
        setAddress('');
        setTipMsg('Disconnect！');
        setAnchorEl(null);
    }

    return (
        <>
            <Button variant="contained" size="medium"
                aria-controls={openMenuItem ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenuItem ? 'true' : undefined}
                endIcon={<WalletIcon />}
                onClick={handleDropMenu} >
                {connect ? address.substring(0, 6) + '...' + address.substring(address.length - 6) : 'Connect Wallet'}
            </Button>
            <Snackbar open={openTip} autoHideDuration={2000} onClose={handleCloseTip}>
                <Alert onClose={handleCloseTip} severity="success" sx={{ width: '100%' }}>
                    {tipMsg}
                </Alert>
            </Snackbar>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={openMenuItem}
                onClose={handleCloseMenu}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={handleCloseMenu}>APT: {apt}</MenuItem>
                <MenuItem onClick={handleCloseMenu}>NetWork: {network}</MenuItem>
                <MenuItem onClick={handleCopyAddress}>Copy Address</MenuItem>
                <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
            </Menu>
            <p>{address}</p>
        </>


    );

}

export default MartianWallet;