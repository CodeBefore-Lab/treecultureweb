import { Marker, Popup } from "react-leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { useMap } from "react-leaflet/hooks";
import "leaflet/dist/leaflet.css";
import { Select, Drawer, Button, Layout, Card, Avatar } from "antd";
import { useEffect, useState } from "react";
import { sendRequest } from "../utils/requests";
import { RiAddBoxFill, RiListOrdered } from "react-icons/ri";
import Meta from "antd/es/card/Meta";
import { FaTree } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const { Content } = Layout;

// 40.234700, 28.864307
//40.237574, 28.874448
//40.228943, 28.872169
//40.237952, 28.867063
var markersMap = [
  { lat: 40.2347, lng: 28.864307 },
  { lat: 40.237574, lng: 28.874448 },
  { lat: 40.228943, lng: 28.872169 },
  { lat: 40.237952, lng: 28.867063 },
];

const LeafIcon = L.Icon.extend({
  options: {},
});

const Maps = () => {
  const [datas, setDatas] = useState();
  const [tab, setTab] = useState("1");
  const [open, setOpen] = useState(false);
  const [trees, setTrees] = useState([]);

  //filter trees by choices id onchange select
  const filterTreeData = (value) => {
    //if value is empty, set trees to default
    if (value.length === 0) {
      getTrees();
      return;
    }
    const filtered = trees.data.filter((tree) => {
      return tree.treeChoices.some((choice) => value.includes(choice.choiceId));
    });

    setTrees({ data: filtered });
  };

  const navigate = useNavigate();
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const fetchData = async () => {
    const data = await sendRequest("GET", "Choices", null);
    setDatas(data);
    console.log(data);
  };

  const switchTab = (tab) => {
    setTab(tab);
  };

  const getTrees = async () => {
    const data = await sendRequest("GET", "Trees", null);

    setTrees(data);
    console.log(data);
  };

  const blueIcon = new LeafIcon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/489/489969.png",
    iconSize: [32, 32],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    fetchData();
    getTrees();
  }, []);

  return (
    <Layout>
      <Content
        style={{
          minHeight: 280,
        }}
      >
        <Drawer placement={"right"} closable={false} onClose={onClose} open={open} key={"right"}>
          <Button
            className="w-full mb-5 bg-green-400 text-white"
            onClick={() => {
              console.log("filtered");
            }}
          >
            Filtrele
          </Button>

          {datas &&
            datas.data.map((data) => (
              <div key={data.groupTitleId} className="flex flex-col">
                <h1 className="text-xl py-3 font-bold">{data.mainTitleName}</h1>
                {data.groupTitles.map((choice) => (
                  <Select
                    key={choice.groupTitleId}
                    mode="multiple"
                    className="w-full mb-5"
                    placeholder={choice.groupTitleName}
                    onChange={(value) => filterTreeData(value)}
                  >
                    {choice.choices.map((item) => (
                      <Select.Option key={item.choiceId} value={item.choiceId}>
                        {item.choiceName}
                      </Select.Option>
                    ))}
                  </Select>
                ))}
              </div>
            ))}
        </Drawer>
        <div className="bg-white p-2 w-full fixed z-10">
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="bg-green-400/70 w-24 text-white font-bold py-2 rounded-lg flex flex-row justify-around">
                <RiAddBoxFill style={{ fontSize: "24px" }} className="hover:text-green-500" onClick={() => switchTab("1")} />
                <RiListOrdered style={{ fontSize: "24px" }} onClick={() => switchTab("2")} />
              </div>
            </div>
            <div className="bg-green-300 w-24 text-white font-bold py-2 rounded-lg flex flex-row justify-around" onClick={showDrawer}>
              <RiListOrdered style={{ fontSize: "24px" }} />
            </div>
          </div>
        </div>
        {tab === "1" ? (
          <MapContainer
            center={[40.228943, 28.872169]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "100vh", width: "100%", zIndex: 0 }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {trees.data &&
              trees.data.map((item, index) => (
                <Marker key={index} position={[item.latitude, item.longitude]} icon={blueIcon}>
                  <Popup className="w-64">
                    <div className="flex flex-col p-1 gap-2 justify-center items-center">
                      <span>{item.treeName}</span>
                      <span>{item.descs.length > 100 ? item.descs.substring(0, 100) + "..." : item.descs}</span>
                      <img src={item.photoUrl} className="w-32" alt="" />
                      <Button onClick={() => navigate(`/Trees/${item.treeId}`)}>Detay</Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        ) : (
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center p-4">
              {trees.data &&
                trees.data.map((tree) => {
                  return (
                    <Card
                      key={tree.treeId}
                      onClick={() => navigate(`/Trees/${tree.treeId}`)}
                      style={{ width: 300 }}
                      cover={<img alt="example" src={tree.photoUrl} />}
                    >
                      <Meta
                        avatar={<Avatar icon={<FaTree />} />}
                        title={tree.treeName}
                        description={tree.descs.length > 100 ? tree.descs.substring(0, 100) + "..." : tree.descs}
                      />
                      <div className="flex flex-wrap gap-2 mt-5">
                        {tree.treeChoices.map((choice) => (
                          <div key={choice.choiceId} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            {choice.choiceName}
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Maps;
