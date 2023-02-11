import { AptosClient, Types } from "aptos";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useState } from "react";
import { ErrorAlert, SuccessAlert } from "../components/Alert";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useAutoConnect } from "../components/AutoConnectProvider";

const WalletButtons = dynamic(() => import("../components/WalletButtons"), {
  suspense: false,
  ssr: false,
});

export const DEVNET_NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1";

const aptosClient = new AptosClient(DEVNET_NODE_URL, {
  WITH_CREDENTIALS: false,
});

export default function App() {
  const {
    connected,
    disconnect,
    account,
    network,
    wallet,
  } = useWallet();

  const { autoConnect, setAutoConnect } = useAutoConnect();
  const [successAlertMessage, setSuccessAlertMessage] = useState<string>("");
  const [errorAlertMessage, setErrorAlertMessage] = useState<string>("");

  return (
    <div>
      {successAlertMessage.length > 0 && (
        <SuccessAlert text={successAlertMessage} />
      )}
      {errorAlertMessage.length > 0 && <ErrorAlert text={errorAlertMessage} />}
      <h1 className="flex justify-center mt-2 mb-4 text-4xl font-extrabold tracking-tight leading-none text-black">
        Aptos Wallet Adapter Demo
      </h1>
      <table className="table-auto w-full border-separate border-spacing-y-8 shadow-lg bg-white border-separate">
        <tbody>
          <tr>
            <td className="px-8 border-t py-4 w-1/4">
              <h3>Wallet Selector</h3>
            </td>
            <td className="px-8 py-4 border-t w-3/4">
              <WalletSelector />
            </td>
          </tr>
          <tr>
            <td className="px-8 py-4 border-t w-1/4">
              <h3>Wallet Name</h3>
            </td>
            <td className="px-8 py-4 border-t w-3/4">
              <div style={{ display: "flex" }}>
                {wallet && (
                  <Image
                    src={wallet.icon}
                    alt={wallet.name}
                    width={25}
                    height={25}
                  />
                )}
                {wallet?.name}
              </div>
              <div>
                <a
                  target="_blank"
                  className="text-sky-600"
                  rel="noreferrer"
                  href={wallet?.url}
                >
                  {wallet?.url}
                </a>
              </div>
              <div>
                <button
                  className={`bg-blue-500  text-white font-bold py-2 px-4 rounded mr-4 ${!connected
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                    }`}
                  onClick={disconnect}
                  disabled={!connected}
                >
                  Disconnect
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <td className="px-8 py-4 border-t">
              <h3>Account</h3>
            </td>
            <td className="px-8 py-4 border-t break-all">
              <div>{account ? account.address : ""}</div>
            </td>
          </tr>
          <tr>
            <td className="px-8 py-4 border-t">
              <h3>Network</h3>
            </td>
            <td className="px-8 py-4 border-t">
              <div>{network ? network.name : ""}</div>
            </td>
          </tr>

          <tr>
            <td className="px-8 py-4 border-t">
              <h3>auto connect</h3>
            </td>
            <td className="px-8 py-4 border-t">
              <div className="relative flex flex-col overflow-hidden">
                <div className="flex">
                  <label className="inline-flex relative items-center mr-5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={autoConnect}
                      readOnly
                    />
                    <div
                      onClick={() => {
                        setAutoConnect(!autoConnect);
                      }}
                      className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
                    ></div>
                  </label>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
