import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  configAppView,
  getUserInfo,
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
  Modal,
  Icon,
  ImageViewer,
  useSnackbar,
} from "zmp-ui";
import { TicketType } from "../type";
const initialTicketState: TicketType = {
  ticket_title: "",
  ticketpriorities: "",
  ticketcategories: "",
  ticketstatus: "",
  id: "",
  status: "",
  contact_mobile: "",
  comments: "",
  helpdesk_over_sla_reason: "",
  related_cpslacategory: "",
  record_id: "",
  ticketid: "",
  starred: "",
  createdtime: "",
  ticket_no: "",
  title: "",
  url: "",
  customer: "",
  email: "",
  phone: "",
  description: "",
  helpdesk_subcategory: "",
};
const CreateTicketPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { openSnackbar } = useSnackbar();
  const [selectedCategory, setSelectedCategory] = useState("");
  const token = localStorage.getItem("token");
  const [apiCalled, setApiCalled] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [newTicket, setNewTicket] = React.useState<TicketType>({
    ...initialTicketState,
  });
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    avatar: "",
  });
  const [isFormInvalid, setIsFormInvalid] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    ticket_title: "",
    // customer: "",
    description: "",
  });
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  function convertFilesToImageTypes(files: File[]) {
    return files.map((file) => ({ src: URL.createObjectURL(file) }));
  }

  const isImage = (file: File) => {
    return file.type.startsWith("image/");
  };

  const images = uploadedFiles.filter((file) => isImage(file));
  const files = uploadedFiles.filter((file) => !isImage(file));

  const imagesForViewer = convertFilesToImageTypes(images);

  const Notifications = async () => {
    const apiKey = "EjgGGiuGQcGntOz3n1LhOYpVYK_S4MLlATc2J34tnllK5CqHT6G";
    const receiverId = "6304414410641560859";
    const miniAppId = "3077214972070612317";

    const url = "https://openapi.mini.zalo.me/notification/template";

    const data = {
      templateId: "00126fd75392bacce383",
      templateData: {
        buttonText: "Xem chi tiết đơn hàng",
        buttonUrl: "https://zalo.me/s/194839900003483517/",
        title: "CloudGO Ticket - Tạo mới ticket",
        contentTitle: "Thông báo ghi nhận ticket",
        contentDescription:
          "Cảm ơn quý khách đã tin tưởng. Chúng tôi đã ghi nhận ticket của bạn và tiến hành xử lý",
      },
    };

    const headers = {
      "X-Api-Key": `Bearer ${apiKey}`,
      "X-User-Id": receiverId,
      "X-MiniApp-Id": miniAppId,
      "Content-Type": "application/json",
    };

    axios
      .post(url, data, { headers })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#1843EF",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "Tạo Ticket",
          leftButton: "back",
        },
      });
    } catch (error) {}
  };

  useEffect(() => {
    if (!apiCalled) {
      getUserInfo({
        success: (data) => {
          const Info = data;
          console.log(data, "Get User Info Success");
          setUserInfo(Info.userInfo);
        },
        fail: (error) => {
          console.log(error);
        },
      });
    }
  }, [apiCalled]);

  const createNewTicket = async () => {
    try {
      if (
        !newTicket.ticket_title ||
        // !newTicket.customer ||
        !newTicket.description
      ) {
        setErrorMessages({
          ticket_title: !newTicket.ticket_title ? "Vui lòng nhập tiêu đề." : "",
          // customer: !newTicket.customer ? "Vui lòng nhập link cài đặt." : "",
          description: !newTicket.description ? "Vui lòng nhập mô tả." : "",
        });
        setIsFormInvalid(true);
        return;
      }
      setErrorMessages({
        ticket_title: "",
        // customer: "",
        description: "",
      });
      setIsFormInvalid(false);

      const headers = {
        "Content-Type": "application/json",
      };

      if (token !== null) {
        headers["token"] = token;
      }
      let data = JSON.stringify({
        RequestAction: "SaveTicket",
        Data: {
          ticket_title: newTicket.ticket_title,
          ticketpriorities: "Normal",
          ticketstatus: "Open",
          ticketcategories: newTicket.ticketcategories,
          description: newTicket.description,
          helpdesk_subcategory: newTicket.helpdesk_subcategory,
        },
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://pms-dev.cloudpro.vn/api/SalesAppApi.php",
        headers: headers,
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
          setNewTicket({ ...initialTicketState });
          Notifications;
          openSnackbar({
            text: "Đã tạo ticket thành công",
            type: "success",
          });
          navigate(`/main`);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      if (error === "SyntaxError: Unexpected token T in JSON at position 0") {
        navigate("/");
      } else {
        console.error(error);
      }
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const selectedImagesArray = Array.from(files);
      setSelectedImages((prevSelectedImages) => [
        ...prevSelectedImages,
        ...selectedImagesArray,
      ]);

      setUploadedFiles((prevUploadedFiles) => [
        ...prevUploadedFiles,
        ...selectedImagesArray,
      ]);

      const storedImages = localStorage.getItem("selectedImages");
      const updatedImages = storedImages
        ? [...JSON.parse(storedImages), ...selectedImagesArray]
        : selectedImagesArray;
      localStorage.setItem("selectedImages", JSON.stringify(updatedImages));
    }
  };

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  useEffect(() => {
    configView();
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  }, []);

  return (
    <Page className="page" hideScrollbar={true}>
      <Box className="section-container">
        <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
          Thông tin Ticket
        </Text>
        <Box mt={3}>
          <Text>
            Tiêu đề <span style={{ color: "red" }}>*</span>
          </Text>
          <Input
            type="text"
            status={isFormInvalid && !newTicket.ticket_title ? "error" : ""}
            errorText={errorMessages.ticket_title}
            placeholder="Nhập tiêu đề"
            value={newTicket.ticket_title}
            onChange={(e) => {
              setNewTicket((prevTicket) => ({
                ...prevTicket,
                ticket_title: e.target.value,
              }));
            }}
          />
        </Box>
        <Box mt={3}>
          {inputFields.map((field, index) =>
            field.name === "ticketcategories" && field.optionsCate ? (
              <Box key={`category-${index}`} mt={3}>
                <Select
                  label="Danh mục"
                  key={`select-${index}`}
                  placeholder={`Chọn ${field.placeholder}`}
                  value={newTicket[field.name]}
                  onChange={(value) =>
                    setNewTicket((prevTicket) => ({
                      ...prevTicket,
                      [field.name]: value,
                    }))
                  }
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
                  value={newTicket[field.name]}
                  onChange={(value) =>
                    setNewTicket((prevTicket) => ({
                      ...prevTicket,
                      [field.name]: value,
                    }))
                  }
                >
                  {field.options.map((option) => (
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
                  value={newTicket[field.name]}
                  onChange={(e) =>
                    setNewTicket((prevTicket) => ({
                      ...prevTicket,
                      [field.name]: e.target.value,
                    }))
                  }
                />
              </Box>
            )
          )}
        </Box>
        <Box mt={3}>
          <Text>
            Link cài đặt
            {/* <span style={{ color: "red" }}>*</span> */}
          </Text>
          <Input
            type="text"
            // status={isFormInvalid && !newTicket.customer ? "error" : ""}
            // errorText={errorMessages.customer}
            placeholder="Vui lòng nhập link cài đặt"
            value={newTicket.customer}
            onChange={(e) => {
              setNewTicket((prevTicket) => ({
                ...prevTicket,
                customer: e.target.value,
              }));
            }}
          />
        </Box>
      </Box>
      <Box mt={3} className="section-container">
        <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
          Thông tin liên hệ
        </Text>
        <Box mt={3}>
          <Text>Họ và tên</Text>
          <Input
            type="text"
            placeholder="Placeholder"
            clearable
            status="success"
            disabled
            value={contactData.data.full_name}
          />
        </Box>
        <Box mt={3}>
          <Text>Di động</Text>
          <Input
            type="text"
            placeholder="Placeholder"
            clearable
            status="success"
            disabled
            value={contactData.data.mobile}
          />
        </Box>
        <Box mt={3}>
          <Text>Email</Text>
          <Input
            type="text"
            placeholder="Trống"
            clearable
            status="success"
            disabled
            value={contactData.data.email}
          />
        </Box>
        <Box mt={3}>
          <Text>Công ty</Text>
          <Input
            type="text"
            placeholder="Trống"
            clearable
            status="success"
            disabled
            value=""
          />
        </Box>
      </Box>
      <Box mt={3} className="section-container">
        <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
          Thông tin mô tả
        </Text>
        <Box mt={3}>
          <Text>
            Mô tả <span style={{ color: "red" }}>*</span>
          </Text>
          <Input.TextArea
            placeholder="Nhập mô tả"
            status={isFormInvalid && !newTicket.description ? "error" : ""}
            errorText={errorMessages.description}
            value={newTicket.description}
            maxLength={100}
            showCount={false}
            onChange={(e) =>
              setNewTicket((prevTicket) => ({
                ...prevTicket,
                description: e.target.value,
              }))
            }
          />
        </Box>
      </Box>
      <Box mt={3} className="section-container">
        <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
          Thông tin hình ảnh
        </Text>
        <Box mt={3}>
          <Text>
            Kích thước tối thiểu 192x192 (JPG, PNG). Dung lượng tối đa 15MB
          </Text>
        </Box>
        <Box flexDirection="row" alignContent="center">
          <Box
            mt={3}
            height={100}
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
            <input
              type="file"
              accept=".jpg, .jpeg, .png, .docx, .xlsx, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => handleImageUpload(e.target.files)}
              multiple
              style={{ display: "none" }}
              ref={fileInputRef}
            />
          </Box>
          <Box flexDirection="row">
            {images.map((image, index) => (
              <div key={index} style={{ margin: "10px", textAlign: "center" }}>
                <img
                  onClick={() => {
                    setActiveIndex(index);
                    setVisible(true);
                  }}
                  src={URL.createObjectURL(image)}
                  alt={`Hình ảnh ${index}`}
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    cursor: "pointer",
                  }}
                />
                <a
                  href={URL.createObjectURL(image)}
                  download={`Hình_ảnh_${index}.jpg`}
                >
                  Tải xuống
                </a>
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

        <Box mt={5}>
          <Button fullWidth onClick={createNewTicket}>
            Lưu
          </Button>
        </Box>
        <Box height={50}></Box>
      </Box>
      <Modal
        visible={confirmModalVisible}
        title="CloudTICKET"
        description="Bạn có chắc muốn rời mini app không?"
        actions={[
          {
            text: "Ở lại Mini App",
            onClick: () => {
              setConfirmModalVisible(false);
            },
            highLight: true,
          },
          {
            text: "Rời khỏi",
            onClick: () => {
              closeApp();
            },
          },
        ]}
      />
    </Page>
  );
};

export default CreateTicketPage;

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
