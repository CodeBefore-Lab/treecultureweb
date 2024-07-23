import { useContext, useEffect, useState } from "react";
import Choices from "../components/choices";
import ThemeContext from "../context";
import { sendRequest } from "../utils/requests";
import { Navigate } from "react-router-dom";
import { Layout, theme } from "antd";
import Navbar from "../components/navbar";

const { Header, Sider, Content } = Layout;

function Dashboard() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const datas = useContext(ThemeContext);

  const [treeName, setTreeName] = useState("");
  const [treeDescription, setTreeDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  //make a request for localhost:5137
  const token = localStorage.getItem("token");

  //create new object for data and selecteddata and set them to the context data

  const setAndShowData = () => {
    //set treename and treedescription and selected data to the context data
    datas.setAllData({ treeName, treeDescription, lines: datas.selected });

    //add tree to the database
    addTree();
  };

  const fetchData = async () => {
    datas.setLoading(true);
    const data = await sendRequest("GET", "Choices", null);

    datas.setLoading(false);
    console.log(datas.data);
    datas.setData(data);
  };

  // {
  //   "treeName": "string",
  //  "latitude": "string",
  //   "longitude": "string",
  //   "description": "string",
  //   "qrCode": "string",
  //   "photoUrl": "string",
  //   "lines": [
  //     {
  //       "choiceId": 0
  //     }
  //   ]
  // }
  //do a post request to the server

  const addTree = async () => {
    const response = await sendRequest("POST", "Trees", {
      treeName: treeName,
      description: treeDescription,
      latitude: latitude,
      longitude: longitude,
      qrCode: "string",
      photoUrl: "string",
      lines: datas.selected,
    });

    const data = await JSON.parse(await response.text());
    console.log(data);

    //clear inputs and selected items
    datas.setSelected([]);
    setTreeName("");
    setTreeDescription("");
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (token === null) {
    return <Navigate to="/login" />;
  }
  return (
    <Layout>
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <div className="flex flex-col space-y-4 w-full gap-5">
          <div className="flex justify-between items-center p-4">
            <div className="text-2xl font-bold text-slate-800">Ağaç Ekleme</div>
          </div>

          <div className="flex flex-col justify-between gap-5">
            <input
              type="text"
              placeholder="Ağaç Adı"
              className="p-3 w-full rounded-xl border-2 border-gray-200 shadow-lg"
              onChange={(e) => setTreeName(e.target.value)}
              value={treeName}
            />
            <textarea
              type="text"
              placeholder="Ağaç Açıklama"
              className="p-3 w-full rounded-xl border-2 border-gray-200 shadow-lg"
              rows={5}
              onChange={(e) => setTreeDescription(e.target.value)}
              value={treeDescription}
            ></textarea>
            <input
              type="text"
              placeholder="Enlem"
              className="p-3 w-full rounded-xl border-2 border-gray-200 shadow-lg"
              onChange={(e) => setLatitude(e.target.value)}
              value={latitude}
            />
            <input
              type="text"
              placeholder="Boylam"
              className="p-3 w-full rounded-xl border-2 border-gray-200 shadow-lg"
              onChange={(e) => setLongitude(e.target.value)}
              value={longitude}
            />
          </div>
          <div className="py-1">
            {datas.data &&
              datas.data.data.map((item) => (
                <div key={item.mainTitleId} className=" p-5 rounded-xl shadow-lg w-full gap-1 flex flex-col justify-between">
                  <p className="text-3xl font-light text-black py-4">{item.mainTitleName}</p>
                  {item.groupTitles.map((group) => (
                    <div key={group.groupTitleId}>
                      <Choices group={group} text={group.groupTitleName} />
                    </div>
                  ))}
                </div>
              ))}
          </div>
          <div className="flex items-center gap-5 w-full justify-end">
            <button className="bg-green-500 text-white p-3 w-full rounded-xl" onClick={setAndShowData}>
              Kaydet
            </button>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default Dashboard;
