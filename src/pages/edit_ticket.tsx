import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import {
  configAppView,
  onConfirmToExit,
  offConfirmToExit,
  closeApp,
} from "zmp-sdk/apis";
import {
  Text,
  Box,
  Page,
  useNavigate,
  Input,
  Select,
  Button,
  Icon,
  Modal,
  ImageViewer,
  useSnackbar,
} from "zmp-ui";
import { TicketType } from "../type";
import url_api from "../service";
const initialTicketState: TicketType = {
  ticket_title: "",
  ticketpriorities: "",
  ticketcategories: "",
  ticketstatus: "",
  id: "",
  status: "",
  comments: "",
  helpdesk_over_sla_reason: "",
  helpdesk_rating: "",
  related_cpslacategory: "",
  record_id: "",
  ticketid: "",
  starred: "",
  createdtime: "",
  ticket_no: "",
  title: "",
  category: "",
  imagename_path: [],
  filename: [],
  imagename: "",
  customer: "",
  contact_email: "",
  contact_name: "",
  contact_mobile: "",
  contact_id: "",
  description: "",
  helpdesk_subcategory: "",
};
const EditTicketPage = () => {
  const navigate = useNavigate();
  const { openSnackbar, closeSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isLinkSettingVisible, setIsLinkSettingVisible] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const ticketId = queryParams.get("id");
  const token = localStorage.getItem("token");
  const [editTicket, setEditTicket] = useState({
    ...initialTicketState,
  });
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const Detail = JSON.parse(localStorage.getItem("detail_ticket") || "{}");
  const [subcategoryOptions, setSubcategoryOptions] = useState([
    Detail.data.ticketcategories,
  ]);
  function convertFilesToImageTypes(files: File[]) {
    return files.map((file) => ({ src: URL.createObjectURL(file) }));
  }

  const text = Detail.data.description;
  const newText = text
    .split(/<br \/>|\\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  const isImage = (file: File) => {
    return file.type.startsWith("image/");
  };

  const images = uploadedFiles.filter((file) => isImage(file));
  const files = uploadedFiles.filter((file) => !isImage(file));
  const imagesForViewer = convertFilesToImageTypes(images);

  useEffect(() => {
    onConfirmToExit(() => setConfirmModalVisible(true));
    console.log("Out Zalo App");
    return () => offConfirmToExit();
  }, []);

  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#006AF5",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "Chỉnh sửa Ticket",
          leftButton: "back",
        },
      });
    } catch (error) {}
  };

  useEffect(() => {
    configView();
  }, []);

  const EditTicket = async (ticketId: string | null) => {
    try {
      openSnackbar({
        text: "Đang chỉnh sửa ticket...",
        type: "loading",
        duration: 10000,
      });

      const formData = new FormData();
      formData.append("RequestAction", "SaveTicket");
      formData.append("Data[id]", ticketId);
      formData.append("Data[ticket_title]", editTicket.ticket_title);
      formData.append("Data[ticketcategories]", editTicket.ticketcategories);
      formData.append(
        "Data[helpdesk_subcategory]",
        editTicket.helpdesk_subcategory
      );
      formData.append("Data[description]", editTicket.description);
      formData.append("Data[contact_email]", editTicket.contact_email);
      formData.append("Data[contact_name]", editTicket.contact_name);
      formData.append("Data[contact_mobile]", editTicket.contact_mobile);
      for (let i = 0; i < editTicket.filename.length; i++) {
        formData.append(`file_${i}`, editTicket.filename[i]);
      }

      const headers = {
        "Content-Type": "multipart/form-data", // Set Content-Type to multipart/form-data
      };

      if (token !== null) {
        headers["token"] = token;
      }

      const config = {
        method: "post",
        url: url_api,
        headers: headers,
        data: formData,
      };

      const response = await axios.request(config);
      console.log(JSON.stringify(response.data.data));
      setEditTicket({ ...initialTicketState });
      openSnackbar({
        text: "Chỉnh sửa ticket thành công",
        type: "success",
      });
      navigate(-1);
    } catch (error) {
      if (error === "SyntaxError: Unexpected token T in JSON at position 0") {
        return;
      } else {
        console.error(error);
      }
    }
  };

  // const Notifications = async () => {
  //   const zalo_id = contactData.data.zalo_id_miniapp;
  //   const apiKey = "EjgGGiuGQcGntOz3n1LhOYpVYK_S4MLlATc2J34tnllK5CqHT6G";
  //   const receiverId = zalo_id;
  //   const miniAppId = "3077214972070612317";

  //   const url = "https://openapi.mini.zalo.me/notification/template";

  //   const data = {
  //     templateId: "00126fd75392bacce383",
  //     templateData: {
  //       buttonText: "Xem chi tiết đơn hàng",
  //       buttonUrl: "https://zalo.me/s/194839900003483517/",
  //       title: "CloudGO Ticket - Tạo mới ticket",
  //       contentTitle: "Thông báo ghi nhận ticket",
  //       contentDescription:
  //         "Cảm ơn quý khách đã tin tưởng. Chúng tôi đã ghi nhận ticket của bạn và tiến hành xử lý",
  //     },
  //   };

  //   const headers = {
  //     "X-Api-Key": `Bearer ${apiKey}`,
  //     "X-User-Id": receiverId,
  //     "X-MiniApp-Id": miniAppId,
  //     "Content-Type": "application/json",
  //   };

  //   axios
  //     .post(url, data, { headers })
  //     .then((response) => {
  //       console.log("Đã gửi thông báo", response.data);
  //     })
  //     .catch((error) => {
  //       console.error("Lỗi khi gửi thông báo", error);
  //     });
  // };

  const maxFiles = 6;
  const maxFileSizeInBytes = 15 * 1024 * 1024;
  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const selectedImagesArray = Array.from(files);
      console.log(files);
      // Kiểm tra kích thước của từng tệp trước khi thêm vào danh sách
      const filesWithinSizeLimit = selectedImagesArray.every(
        (file) => file.size <= maxFileSizeInBytes
      );

      if (!filesWithinSizeLimit) {
        // Hiển thị thông báo hoặc xử lý khi một hoặc nhiều tệp vượt quá kích thước giới hạn
        openSnackbar({
          text: `Kích thước tệp vượt quá giới hạn 15MB.`,
          type: "error",
        });
        return;
      }

      // Kiểm tra số lượng hình ảnh đã chọn
      if (selectedImagesArray.length + editTicket.filename.length <= maxFiles) {
        // Cập nhật danh sách hình ảnh đã chọn
        setSelectedImages((prevSelectedImages) => [
          ...prevSelectedImages,
          ...selectedImagesArray,
        ]);

        setUploadedFiles((prevUploadedFiles) => [
          ...prevUploadedFiles,
          ...selectedImagesArray,
        ]);

        setEditTicket((prevTicket) => ({
          ...prevTicket,
          filename: files,
        }));
      } else {
        // Hiển thị thông báo hoặc xử lý khi vượt quá giới hạn tệp
        openSnackbar({
          text: `Chỉ được tải lên tối đa ${maxFiles} hình ảnh và tệp.`,
          type: "error",
        });
      }
    }
  };

  const handleDeleteImage = (index) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);

    const updatedUploadedFiles = [...uploadedFiles];
    updatedUploadedFiles.splice(index, 1);
    setUploadedFiles(updatedUploadedFiles);

    const updatedImagePaths = updatedImages.map((file) =>
      URL.createObjectURL(file)
    );
    setEditTicket((prevTicket) => ({
      ...prevTicket,
      imagename: updatedImagePaths,
    }));

    // Đóng hình ảnh khi người dùng xóa
    setVisible(false);

    if (index === activeIndex) {
      setActiveIndex(0);
    }
  };

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    editTicket.ticket_title = Detail.data.ticket_title;
    editTicket.ticketcategories = Detail.data.ticketcategories;
    editTicket.helpdesk_subcategory = Detail.data.helpdesk_subcategory;
    editTicket.description = newText;
    if (Detail.data.ticketcategories === "Feedback") {
      setIsLinkSettingVisible(false);
    } else {
      setIsLinkSettingVisible(true);
    }
  }, []);

  const categoryToSubcategoryMapping = {
    Bug: [
      "customer",
      "product",
      "campaign_mktlist",
      "potential_quote_salesorder_invoice",
      "receipt_payment",
      "dashboard_report",
      "zalochat_chatbot",
      "filter_search",
      "calendar_task_project",
      "callcenter",
      "email_sms_zns",
      "ticket_faq",
      "admin",
      "other",
    ],
    Feedback: [
      "request_feature",
      "request_consulting",
      "staff_feedback",
      "application_performance",
      "uiux",
      "other",
    ],
  };

  const updateSubcategories = () => {
    const selectedCategory = editTicket.ticketcategories;
    const subcategories = categoryToSubcategoryMapping[selectedCategory] || [];

    setSubcategoryOptions(subcategories);

    setEditTicket((prevTicket) => ({
      ...prevTicket,
      helpdesk_subcategory: subcategories[0] || "",
    }));
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setIsLinkSettingVisible(value === "Bug");
    setEditTicket((prevTicket) => ({
      ...prevTicket,
      ticketcategories: value,
    }));
  };

  useEffect(() => {
    updateSubcategories();
  }, [editTicket.ticketcategories]);

  return (
    <Page
      className="section-page"
      hideScrollbar={true}
      // restoreScrollOnBack={false}
    >
      <Box className="bgr-color">
        <Text style={{ fontWeight: 500, padding: "16px" }}>
          Thông tin Ticket
        </Text>
        <Box
          height={1.5}
          style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
        ></Box>
        <Box className="detail-container">
          <Box>
            <Text>Tiêu đề</Text>
            <Input
              type="text"
              value={editTicket.ticket_title}
              onChange={(e) => {
                setEditTicket((prevTicket) => ({
                  ...prevTicket,
                  ticket_title: e.target.value,
                }));
              }}
            />
          </Box>

          <Box mt={2}>
            {inputFields.map((field, index) =>
              field.name === "ticketcategories" && field.optionsCate ? (
                <Box key={`category-${index}`} mt={3}>
                  <Select
                    label="Danh mục"
                    key={`select-${index}`}
                    placeholder={`Chọn ${field.placeholder}`}
                    value={editTicket.ticketcategories}
                    closeOnSelect={true}
                    onChange={(value) => {
                      handleCategoryChange(value);
                      setEditTicket((prevTicket) => ({
                        ...prevTicket,
                        [field.name]: value,
                      }));
                    }}
                  >
                    {field.optionsCate.map((option) => (
                      <Select.Option
                        key={option}
                        title={translationCategory[option]}
                        value={option}
                      >
                        {translationCategory[option]}
                      </Select.Option>
                    ))}
                  </Select>
                </Box>
              ) : field.options ? (
                <Box key={`select-${index}`} mt={3}>
                  <Select
                    label="Chi tiết danh mục"
                    key={`select-${index}`}
                    placeholder={`Chọn ${field.placeholder}`}
                    defaultValue={Detail.data.helpdesk_subcategory}
                    closeOnSelect={true}
                    onChange={(value) => {
                      setEditTicket((prevTicket) => ({
                        ...prevTicket,
                        [field.name]: value,
                      }));
                      console.log(value);
                    }}
                  >
                    {subcategoryOptions.map((option) => (
                      <Select.Option
                        key={option}
                        title={translationDetailCategory[option]}
                        value={option}
                      >
                        {translationDetailCategory[option]}
                      </Select.Option>
                    ))}
                  </Select>
                </Box>
              ) : (
                <Box key={`box-${index}`} mt={3}>
                  <Input
                    key={field.name}
                    type="text"
                    value={editTicket[field.name]}
                    onChange={(e) =>
                      setEditTicket((prevTicket) => ({
                        ...prevTicket,
                        [field.name]: e.target.value,
                      }))
                    }
                  />
                </Box>
              )
            )}
          </Box>
          {isLinkSettingVisible && (
            <Box mt={3}>
              <Text>Link cài đặt</Text>
              <Input
                type="text"
                placeholder="Vui lòng nhập link cài đặt"
                value={editTicket.customer}
                onChange={(e) => {
                  setEditTicket((prevTicket) => ({
                    ...prevTicket,
                    customer: e.target.value,
                  }));
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      <Box mt={2} className="bgr-color">
        <Text style={{ fontWeight: 500, padding: "16px" }}>
          Thông tin liên hệ
        </Text>
        <Box
          height={1.5}
          style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
        ></Box>
        <Box className="detail-container">
          <Box>
            <Text>Họ và tên</Text>
            <Input
              type="text"
              disabled
              style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
              value={Detail.data.contact_name}
            />
          </Box>
          <Box mt={3}>
            <Text>Di động</Text>
            <Box>
              <Box mt={1} flexDirection="row" alignItems="center">
                <Box
                  height={48}
                  flexDirection="row"
                  style={{
                    width: "23%",
                    borderTopLeftRadius: "8px",
                    borderBottomLeftRadius: "8px",
                    backgroundColor: "rgba(214, 217, 220, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(20, 20, 21, 1)",
                      paddingRight: "4px",
                    }}
                  >
                    +84
                  </Text>
                  <Icon
                    icon="zi-chevron-down"
                    size={16}
                    style={{ paddingTop: "2px" }}
                  ></Icon>
                </Box>
                <Input
                  type="text"
                  style={{
                    width: "85%",
                    backgroundColor: "rgba(244, 245, 246, 1)",
                    borderTopLeftRadius: "0px",
                    borderBottomLeftRadius: "0px",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "8px",
                  }}
                  value={Detail.data.contact_mobile.replace(/^84/, "")}
                  disabled
                />
              </Box>
            </Box>
          </Box>
          <Box mt={3}>
            <Text>Email</Text>
            <Input
              placeholder="Nhập mô tả"
              value={editTicket.contact_email || Detail.data.contact_email}
              onChange={(e) => {
                const value = e.target.value;
                setEditTicket((prevTicket) => ({
                  ...prevTicket,
                  contact_email: value,
                }));
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box mt={2} className="bgr-color">
        <Text style={{ fontWeight: 500, padding: "16px" }}>
          Thông tin mô tả
        </Text>
        <Box
          height={1.5}
          style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
        ></Box>
        <Box className="detail-container">
          <Text>Mô tả</Text>
          <Input.TextArea
            placeholder="Nhập mô tả"
            value={
              editTicket.description === null ? "" : editTicket.description
            }
            onChange={(e) => {
              const value = e.target.value;
              setEditTicket((prevTicket) => ({
                ...prevTicket,
                description: value,
              }));
            }}
            style={{ whiteSpace: "pre-wrap" }}
          />
        </Box>
      </Box>

      <Box mt={2} className="bgr-color">
        <Text style={{ fontWeight: 500, padding: "16px" }}>
          Thông tin hình ảnh
        </Text>
        <Box
          height={1.5}
          style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
        ></Box>
        <Box className="detail-container">
          <Text>
            Kích thước tối thiểu 192x192 (JPG, PNG). Dung lượng tối đa 15MB
          </Text>
          <Box flexDirection="row" mt={3} className="image-list-container">
            <Box>
              <Box
                height={100}
                width={100}
                className="choose-image"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span onClick={handleIconClick}>
                  <Icon
                    style={{ cursor: "pointer" }}
                    icon="zi-camera"
                    size={32}
                  ></Icon>
                </span>
              </Box>

              <input
                type="file"
                accept=".jpg, .jpeg, .png, .docx, .xlsx, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => handleImageUpload(e.target.files)}
                multiple
                style={{ display: "none" }}
                ref={fileInputRef}
              />
            </Box>
            {images.map((image, index) => (
              <div
                key={index}
                style={{ marginLeft: "10px", textAlign: "center" }}
              >
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      onClick={() => {
                        setActiveIndex(index);
                        setVisible(true);
                      }}
                      src={URL.createObjectURL(image)}
                      alt={`Hình ảnh ${index}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {Detail.data.imagename_path.slice(0, 6).map((path, index) => (
              <div
                key={index}
                style={{ marginLeft: "10px", textAlign: "center" }}
              >
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      key={index}
                      style={{
                        paddingLeft: "6px",
                        width: "100px",
                        height: "100px",
                      }}
                      src={"https://pms-dev.cloudpro.vn/" + path}
                      alt={`Image ${index + 1}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Box>
          <ImageViewer
            onClose={() => setVisible(false)}
            activeIndex={activeIndex}
            images={imagesForViewer}
            visible={visible}
          ></ImageViewer>
        </Box>
        <ul>
          {files.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      </Box>
      <Box mt={2} className="section-container">
        <Button
          fullWidth
          style={{ borderRadius: "8px" }}
          onClick={() => EditTicket(ticketId)}
        >
          Lưu
        </Button>
        <Box height={100}></Box>
      </Box>
      <Modal visible={confirmModalVisible}>
        <img
          style={{
            width: "100px",
            height: "100px",
            display: "block",
            margin: "0 auto",
          }}
          src="https://clipart-library.com/images/gTe5bLznc.gif"
        />

        <Text
          style={{
            fontWeight: 500,
            fontSize: "24px",
            textAlign: "center",
            paddingTop: "24px",
            paddingBottom: "16px",
          }}
        >
          My CloudGO
        </Text>
        <Text
          style={{
            fontWeight: 500,
            color: "rgba(118, 122, 127, 1)",
            paddingBottom: "32px",
          }}
        >
          Bạn có chắc chắn rời khỏi Mini App không?
        </Text>
        <Box
          flex
          flexDirection="row"
          justifyContent="center"
          alignContent="center"
        >
          <Button
            variant="tertiary"
            style={{
              padding: "8px",
              width: "45%",
              borderRadius: "8px",
              border: "1px rgba(0, 106, 245, 1) solid ",
            }}
            size="medium"
            onClick={() => {
              closeApp();
            }}
          >
            Rời khỏi
          </Button>
          <Box width={5} height={1}></Box>
          <Button
            style={{
              padding: "8px",
              width: "45%",
              borderRadius: "8px",
            }}
            size="medium"
            onClick={() => {
              setConfirmModalVisible(false);
              offConfirmToExit();
            }}
          >
            Ở lại Mini App
          </Button>
        </Box>
      </Modal>
    </Page>
  );
};

export default EditTicketPage;

const inputFields = [
  {
    name: "ticketcategories",
    placeholder: "danh mục",
    optionsCate: ["Bug", "Feedback"],
  },
  {
    name: "helpdesk_subcategory",
    placeholder: "chi tiết danh mục",
    options: [
      "customer",
      "product",
      "campaign_mktlist",
      "potential_quote_salesorder_invoice",
      "receipt_payment",
      "dashboard_report",
      "zalochat_chatbot",
      "filter_search",
      "calendar_task_project",
      "callcenter",
      "email_sms_zns",
      "ticket_faq",
      "admin",
      "request_feature",
      "request_consulting",
      "staff_feedback",
      "application_performance",
      "uiux",
      "other",
    ],
  },
];

const translationCategory = {
  Bug: "Báo lỗi",
  Feedback: "Góp ý",
};

const translationDetailCategory = {
  customer: "Khách hàng",
  product: "Sản phẩm",
  campaign_mktlist: "Chiến dịch, Marketing list",
  potential_quote_salesorder_invoice: "Cơ hội, Báo giá, Đơn hàng, Hoá đơn",
  receipt_payment: "Phiếu thu, Phiếu chi",
  dashboard_report: "Trang chủ, Báo cáo",
  zalochat_chatbot: "ChatZalo, ChatBot",
  filter_search: "Bộ lọc, Tìm kiếm",
  calendar_task_project: "Lịch làm việc, Công việc, Dự án",
  callcenter: "Tổng đài",
  email_sms_zns: "Email, SMS, ZNS",
  ticket_faq: "Ticket, Kho kiến thức",
  admin: "Admin (Phân quyền, cấu hình)",
  other: "Khác",
  request_feature: "Yêu cầu bổ sung tính năng",
  request_consulting: "Yêu cầu tư vấn",
  staff_feedback: "Góp ý nhân viên",
  application_performance: "Tốc độ phần mềm",
  uiux: "Trải nghiệm người dùng, bố cục, giao diện",
};
