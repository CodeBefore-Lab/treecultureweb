import { useContext, useEffect, useState, useRef, useMemo } from "react";
import Choices from "../components/choices";
import ThemeContext from "../context";
import { sendRequest } from "../utils/requests";
import { Navigate, useNavigate } from "react-router-dom";
import { Layout, notification, theme } from "antd";
import JoditEditor from "jodit-react";

const { Content } = Layout;

function Category() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const datas = useContext(ThemeContext);
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [categoryImage, setCategoryImage] = useState(""); // Renamed from categoryImageUrl

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    datas.setLoading(true);
    const data = await sendRequest("GET", "Choices", null);
    datas.setLoading(false);
    datas.setData(data);
  };

  const addCategory = async () => {
    const response = await sendRequest("POST", "TreeCategories", {
      name: categoryName,
      description: categoryDescription,
      choiceIds: datas.selected.map((choice) => choice.choiceId),
      image: categoryImage, // Changed to match the API structure
    });

    if (response.success) {
      notification.success({
        message: "Kategori başarıyla eklendi",
        description: "Kategori başarıyla eklendi",
      });
      navigate("/categories");
    } else {
      notification.error({
        message: "Kategori eklenemedi",
        description: "Kategori eklenemedi",
      });
    }

    datas.setSelected([]);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryImage(""); // Clear the image input
  };

  const handleDescriptionChange = (newContent) => {
    setCategoryDescription(newContent);
    setShowWarning(newContent.trim() === "");
  };

  useEffect(() => {
    fetchData();
    // Sayfaya her girişte seçili öğeleri sıfırla
    datas.setSelected([]);
  }, []);

  if (token === null) {
    return <Navigate to="/login" />;
  }

  const editor = useRef(null);
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Kategori Açıklama...",
      height: 300,
    }),
    []
  );

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
            <div className="text-2xl font-bold text-slate-800">Kategori Ekleme</div>
          </div>

          <div className="flex flex-col justify-between gap-5">
            <input
              type="text"
              placeholder="Kategori Adı"
              className="p-3 w-full rounded-xl border-2 border-gray-200 shadow-lg"
              onChange={(e) => setCategoryName(e.target.value)}
              value={categoryName}
            />
            <p className="text-red-500 text-sm">Kategori adı boş bırakılamaz!</p>

            <JoditEditor ref={editor} value={categoryDescription} config={config} tabIndex={1} onBlur={handleDescriptionChange} onChange={(newContent) => {}} />
            <p className="text-red-500 text-sm">Açıklama boş bırakılamaz!</p>

            <input
              type="text"
              placeholder="Kategori Resim URL'si"
              className="p-3 w-full rounded-xl border-2 border-gray-200 shadow-lg"
              onChange={(e) => setCategoryImage(e.target.value)}
              value={categoryImage}
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
            <button className="bg-green-500 text-white p-3 w-full rounded-xl" onClick={addCategory}>
              Kaydet
            </button>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default Category;
