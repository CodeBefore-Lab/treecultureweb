import React, { useEffect, useState } from "react";

const TreeDetails = () => {
  const [datas, setDatas] = useState();
  //get params from url
  const url = window.location.href;
  const params = url.split("/");
  const id = params[params.length - 1];
  //get tree details

  const getTree = async () => {
    const response = await fetch(
      `https://api.pestomat.com/v1/treewebapi/trees/
    ${id}?id=${id}
    `,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token_tree")}`,
        },
      }
    );

    const data = await JSON.parse(await response.text());
    setDatas(data);
    console.log(data);
    if (data.status === 404) {
      setDatas(null);
    }
  };

  useEffect(() => {
    getTree();
  }, []);

  return (
    <div className="bg-white p-4 rounded-md shadow-md m-4 flex justify-center items-center flex-col">
      {datas ? <p>{"Ağaç İsmi: " + datas?.treeName + " " + "Açıklama: " + datas?.descs}</p> : <p>No data</p>}
    </div>
  );
};

export default TreeDetails;
