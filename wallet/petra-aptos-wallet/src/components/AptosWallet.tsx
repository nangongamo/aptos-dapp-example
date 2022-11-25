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

function AptosWallet() {

    const [connectStatus, setConnectStatus] = useState<boolean>();
    const [connectText, setConnectText] = useState<string | null>('Connect Wallet');
    const [address, setAddress] = useState('');
    const [openTip, setOpenTip] = useState(false);
    const [tipMsg, setTipMsg] = useState('');
    const [apt, setApt] = useState('0');

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMenuItem = Boolean(anchorEl);

    useEffect(() => {
        if (!window.aptos) return;
        window.aptos.isConnected().then(setConnectStatus);
        if (!connectStatus) {
            setConnectText('Connect Wallet');
        }
    }, [connectStatus]);

    const handleCloseTip = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenTip(false);
    };


    const handleDropMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!window.aptos) {
            alert("Petra Aptos Wallet: https://petra.app/");
            return;
        }
        if (!connectStatus) {
            window.aptos!.connect().then(() => {
                window.aptos.isConnected().then((data: boolean) => {
                    setConnectStatus(data);
                    setOpenTip(true);
                    window.aptos.account().then((data: { address: string }) => {
                        setAddress(data.address);
                        setConnectText(data.address.substring(0, 6) + '...' + data.address.substring(data.address.length - 4));
                        client.getAccountResource(data.address, TYPE_APTOS_COIN).then((result: Types.MoveResource) => {
                            let coin = (result.data) && (result.data as any)['coin'];
                            let coinAmt = coin && (coin as any)['value'];
                            setApt(new BigNumber(coinAmt).div(100000000).toString());
                        });
                    });
                    setTipMsg('Connection Succeeded！');
                });
            });
            return;
        }
        setAnchorEl(event.currentTarget);
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

    const handleDisconnect = () => {
        window.aptos.disconnect().then(() => {
            window.aptos.isConnected().then((data: boolean) => {
                setAnchorEl(null);
                setConnectStatus(data);
                setOpenTip(true);
                setAddress('');
                setTipMsg('Disconnected！');
            });
        });
    }

    return (
        <>
            <Button variant="contained" size="medium"
                aria-controls={openMenuItem ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenuItem ? 'true' : undefined}
                endIcon={<WalletIcon />}
                onClick={handleDropMenu} >
                {connectText}
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
                <MenuItem onClick={handleCloseMenu}>{apt} APT</MenuItem>
                <MenuItem onClick={handleCopyAddress}>Copy Address</MenuItem>
                <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
            </Menu>
            <p>{address}</p>
        </>


    );

}

export default AptosWallet;