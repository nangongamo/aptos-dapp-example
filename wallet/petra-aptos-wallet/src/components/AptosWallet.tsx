import React, { useEffect, useState } from "react";
import { Types, AptosClient } from 'aptos';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const client = new AptosClient('https://fullnode.testnet.aptoslabs.com');

function AptosWallet() {

    const [connectStatus, setConnectStatus] = useState<boolean | null>(null);
    const [connectText, setConnectText] = useState<string | null>('Connect Wallet');
    const [address, setAddress] = useState('');
    const [openTip, setOpenTip] = useState(false);
    const [tipMsg, setTipMsg] = useState('');

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
                    localStorage.setItem("aptosWallet", "Petra");
                    window.aptos.account().then((data: { address: string }) => {
                        setAddress(data.address);
                        setConnectText(data.address.substring(0, 6) + '...' + data.address.substring(data.address.length - 4));
                        client.getAccountResource(data.address, '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>').then((result: Types.MoveResource) => {
                            console.log(result);
                        });
                    });
                    setTipMsg('钱包已连接上！');
                });
            });
            return;
        }
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleDisconnect = () => {
        window.aptos.disconnect().then(() => {
            window.aptos.isConnected().then((data: boolean) => {
                setAnchorEl(null);
                setConnectStatus(data);
                setOpenTip(true);
                setAddress('');
                localStorage.removeItem("aptosWallet");
                setTipMsg('已断开连接了！');
            });
        });
    }

    return (
        <>
            <Button variant="contained" size="medium"
                aria-controls={openMenuItem ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenuItem ? 'true' : undefined}
                endIcon={<SendIcon />}
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
                <MenuItem onClick={handleCloseMenu}>100 APT</MenuItem>
                <MenuItem onClick={handleCloseMenu}>Copy Address</MenuItem>
                <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
            </Menu>
            <p>{address}</p>
        </>


    );

}

export default AptosWallet;