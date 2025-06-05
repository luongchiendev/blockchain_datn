/* eslint-disable no-unused-vars */
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { contractAbi, contractAddress } from '../utils/constants';
import { useSnackbar } from 'notistack';

const Share = () => {

    const { enqueueSnackbar } = useSnackbar();

    contractAddress

    const [account, setAccount] = useState('');
    const [contract, setContract] = useState('');
    const [provider, setProvider] = useState('');
    const [sharedAddress, setSharedAddress] = useState([]);



    useEffect(() => {

        if (window.ethereum) {

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const loadProvider = async () => {
                if (provider) {
                    window.ethereum.on('chainChanged', () => {
                        window.location.reload();
                    })

                    window.ethereum.on('accountsChanged', () => {
                        window.location.reload();
                    })

                    await provider.send("eth_requestAccounts", [])
                    const signer = provider.getSigner();
                    const address = await signer.getAddress();
                    setAccount(address);
                    console.log('contractAddress ', contractAddress)
                    console.log('abi ', contractAbi)

                    const contract = new ethers.Contract(
                        contractAddress, contractAbi, signer
                    )
                    setContract(contract);
                    setProvider(provider)
                }
                else {
                    console.log("MetaMask is not installed")

                }
            }
            provider && loadProvider();
        }
        else {
            enqueueSnackbar("Please install Metamask", { variant: 'warning' });
        }

    },
        []
    )


    useEffect(() => {
        if (window.ethereum) {

            const accessList = async () => {
                if (provider) {
                    const addressList = await contract.shareAccess();
                    console.log(addressList)
                    setSharedAddress(addressList);
                }
            };
            contract && accessList();
        }

    }, [contract]);







    const sharing = async () => {
        const address = document.querySelector(".address").value;
        await contract.allow(address);
        window.location.reload()
    };

    const removAccess = async (address) => { 
        await contract.disallow(address);
        window.location.reload()
    };


    return (

        <>
            <div id='files' className=" bg-gray-200   mx-auto max-w-7xl  sm:px-6   lg:px-8  py-5 md:py-10 my-5">

                <div className="text-3xl font-bold shadow-sm text-black  border-bottom-1"> Shared Files With Accounts</div>

                <p style={{ color: "black" }}>
                    {account ? '' : "Please connect your metamusk account to view"}
                </p>

            
                <div className="grid grid-cols-5 w-full gap-2 left mb-10"> 
                <input
                    type="text"
                    placeholder="Enter Others Address "
                    className="bg-white text-black h-10 col-span-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                
                <button className="button bg-btn  w-full col-span-1 text-white hover:bg-green-700"  onClick={() => sharing()}>
                    Share
                </button> 
            </div>


                <ol className="grid grid-cols-1 md:grid-cols-1  gap-1  ">
                    {sharedAddress.map((address, id) => (
                        (address[1])? (

                            <li key={id} className="flex justify-between gap-x-1 bg-gray-200  py-0 px-2     ">
                            <div className="flex min-w-0 gap-x-1    ">
                            <div className="text-sm font-semibold leading-6 text-black whitespace-normal break-words mb-1  ">
                            <span className='font-bold text-black'>Account {id + 1}:</span>  {address[0]} </div>
                            <span className='bg-red-500 text-white border p-1 cursor-pointer '
                            
                            onClick={()=>removAccess(address[0])}
                            >
                            Remove Access
                            {/* <TrashIcon className="h-4 w-4 text-red-900  " />   */}
                            </span>
                            </div>
                            
                            </li>
                        ): ""
                    ))}
                </ol>
                

            </div>




        </>
    );
}

export default Share;
