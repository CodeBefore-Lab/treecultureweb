import { useContext, useEffect, useState } from "react";
import Choices from "../components/choices";
import ThemeContext from "../context";
import { sendRequest } from "../utils/requests";
import { Navigate, useParams } from "react-router-dom";
import { Layout, theme } from "antd";

const { Content } = Layout;

function UpdateTree() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { id } = useParams();
  const datas = useContext(ThemeContext);

  const [treeName, setTreeName] = useState("");
  const [treeDescription, setTreeDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [qrCode, setQrCode] = useState("");

  const token = localStorage.getItem("token");

  // Fetch the tree data by id
  const fetchTreeData = async () => {
    datas.setLoading(true);
    const response = await sendRequest("GET", `Trees/${id}`, null);

    const data = await response;

    if (data.success) {
      const treeData = data.data[0];
      setTreeName(treeData.treeName);
      setTreeDescription(treeData.descs);
      setLatitude(treeData.latitude);
      setLongitude(treeData.longitude);
      setPhotoUrl(treeData.photoUrl);
      setQrCode(treeData.qrCode);
      datas.setSelected(treeData.treeChoices);
    }
    datas.setLoading(false);
  };

  // Update the tree data
  const updateTreeData = async () => {
    datas.setLoading(true);
    const response = await sendRequest("PUT", `Trees/${id}`, {
      treeName,
      description: treeDescription,
      latitude,
      longitude,
      qrCode,
      photoUrl,
      treeChoices: datas.selected,
    });
    datas.setLoading(false);
    // Handle the response as needed
  };

  // Fetch choices data
  const fetchData = async () => {
    datas.setLoading(true);
    const data = await sendRequest("GET", "Choices", null);
    datas.setLoading(false);
    datas.setData(data);
  };

  useEffect(() => {
    fetchTreeData();
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
            <div className="text-2xl font-bold text-slate-800">Ağaç Güncelle</div>
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
            <button className="bg-green-500 text-white p-3 w-full rounded-xl" onClick={updateTreeData}>
              Güncelle
            </button>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default UpdateTree;
