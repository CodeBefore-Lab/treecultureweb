import React, { useEffect, useState } from "react";

const TreeDetails = () => {
  const [datas, setDatas] = useState();
  //get params from url
  const url = window.location.href;
  const params = url.split("/");
  const id = params[params.length - 1];

  const getTree = async () => {
    const response = await fetch(`http://160.20.111.43:3006/api/trees/${id}?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token_tree")}`,
      },
    });

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

  // Yardımcı fonksiyon: İlk resmi veya placeholder'ı döndürür
  const getFirstImageOrPlaceholder = (photoUrl) => {
    if (photoUrl) {
      const urls = photoUrl.split(",");
      return urls[0].trim(); // İlk resmi al ve boşlukları temizle
    }
    return "https://via.placeholder.com/300"; // Placeholder resim URL'si
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md m-4 flex justify-center items-center flex-col">
      {datas ? (
        <>
          <img src={getFirstImageOrPlaceholder(datas.photoUrl)} alt={datas.treeName} className="w-full h-64 object-cover mb-4 rounded-md" />
          <p>{"Ağaç İsmi: " + datas.treeName + " " + "Açıklama: " + datas.descs}</p>
        </>
      ) : (
        <p>No data</p>
      )}
    </div>
  );
};

export default TreeDetails;
