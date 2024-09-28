import { useContext, useEffect, useState, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";
import Choices from "../components/choices";
import ThemeContext from "../context";
import { sendRequest } from "../utils/requests";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { Layout, theme, notification } from "antd";

const { Content } = Layout;

function UpdateTree() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { id } = useParams();
  const datas = useContext(ThemeContext);
  const navigate = useNavigate();

  const [treeName, setTreeName] = useState("");
  const [treeDescription, setTreeDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState("");

  const editor = useRef(null);
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Ağaç Açıklama...",
      height: 300,
    }),
    []
  );

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
      setPhotoUrls(treeData.photoUrl); // Değiştirildi: photoUrl'i photoUrls olarak set et
      setQrCode(treeData.qrCode);
      datas.setSelected(treeData.treeChoices);

      // Generate QR code URL put full url https://peyzajbitkileri.uludag.edu.tr/tree/id
      const qrData = `https://peyzajbitkileri.uludag.edu.tr/trees/${id}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
      setQrCodeUrl(qrUrl);
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
      photoUrl: photoUrls, // Değiştirildi: photoUrls'i gönder
      treeChoices: datas.selected,
    });
    datas.setLoading(false);

    if (response.success) {
      notification.success({
        message: "Başarılı",
        description: "Ağaç bilgileri başarıyla güncellendi.",
      });
      navigate("/trees"); // Assuming you have a route for listing trees
    } else {
      notification.error({
        message: "Hata",
        description: "Ağaç güncellenirken bir hata oluştu.",
      });
    }
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
            <JoditEditor ref={editor} value={treeDescription} config={config} tabIndex={1} onBlur={(newContent) => setTreeDescription(newContent)} />
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
            <input
              type="text"
              placeholder="Fotoğraf URL'leri (virgülle ayırın)"
              className="p-3 w-full rounded-xl border-2 border-gray-200 shadow-lg"
              onChange={(e) => setPhotoUrls(e.target.value)}
              value={photoUrls}
            />
          </div>

          {/* Add QR Code display */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-semibold">Ağaç QR Kodu</p>
            {qrCodeUrl && <img src={qrCodeUrl} alt="Tree QR Code" className="border-2 border-gray-200 rounded-xl" />}
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
