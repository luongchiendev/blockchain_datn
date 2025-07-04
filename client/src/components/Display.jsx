/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { useSnackbar } from 'notistack';
import "./Display.css";
const Display = ({ contract, account }) => {
  const [data, setData] = useState("");
  
  const { enqueueSnackbar } = useSnackbar();
  const getdata = async () => {
    let dataArray;
    const Otheraddress = document.querySelector(".address").value;
    try {
      if (Otheraddress) {
        dataArray = await contract.display(Otheraddress);
        console.log(dataArray);
      } else {
        dataArray = await contract.display(account);
      }
    } catch (e) {
      enqueueSnackbar("You don't have the access", { variant: 'warning' });
    }
    const isEmpty = Object.keys(dataArray).length === 0;

    if (!isEmpty) {
      const str = dataArray.toString();
      const str_array = str.split(",");
      // console.log(str);
      // console.log(str_array);
      const images = str_array.map((item, i) => {
        return (
          <>
          <a href={item} key={i} target="_blank" rel="noreferrer">
            <img
              key={i}
              // src={`https://gateway.pinata.cloud/ipfs/${item.substring(36)}`}
              src={`https://gateway.pinata.cloud/ipfs/QmQvi5s12wdKnuNqRuoLHEekY19EBk7bWjne2b1NARwcyi`}
              
              alt="new"
              className="image-list"
              ></img>
          </a>
        </>
        );
      });
      setData(images);
    } else {
      enqueueSnackbar("No image to display", { variant: 'warning' });
    }
  };
  return (
    <>
      <div className="image-list">{data}</div>
      <input
        type="text"
        placeholder="Enter Address"
        className="address"
      ></input>
      <button className="center button" onClick={getdata}>
        Get Data
      </button>

 


    </>
  );
};
export default Display;
export const GetAllData= async() =>{
  getdata();
}
