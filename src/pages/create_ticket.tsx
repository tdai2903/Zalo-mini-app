import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import {
  configAppView,
  requestCameraPermission,
  setNavigationBarLeftButton,
  onConfirmToExit,
  offConfirmToExit,
  closeApp,
  chooseImage,
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
  contact_id: "",
  contact_name: "",
  contact_mobile: "",
  description: "",
  helpdesk_subcategory: "",
};
const CreateTicketPage = ({ onReturnHome }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  // const request = require("request");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const Detail = JSON.parse(localStorage.getItem("detail_ticket") || "{}");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { openSnackbar } = useSnackbar();
  const [selectedCategory, setSelectedCategory] = useState("");
  const token = localStorage.getItem("token");
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [modalConfirmTicket, setModalConfirmTicket] = useState(false);
  const [isLinkSettingVisible, setIsLinkSettingVisible] = useState(true);
  const [isFieldsFilled, setIsFieldsFilled] = useState(false);
  const [inputDescription, setInputDescription] = useState("");
  const [inputLinkSetting, setInputLinkSetting] = useState("");
  const [newTicket, setNewTicket] = React.useState<TicketType>({
    ...initialTicketState,
  });
  const [isFormInvalid, setIsFormInvalid] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    ticket_title: "",
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
  const returnHome = () => {
    onReturnHome();
  };

  const {
    ticket_title,
    ticketcategories,
    helpdesk_subcategory,
    contact_name,
    contact_mobile,
    contact_email,
    description,
    imagename_path,
  } = state ?? {};

  const text = Detail.data.description;
  const newText = text
    .split(/<br \/>|\\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  const configView = async () => {
    try {
      await configAppView({
        headerColor: "#006AF5",
        headerTextColor: "white",
        hideAndroidBottomNavigationBar: true,
        hideIOSSafeAreaBottom: true,
        actionBar: {
          title: "Tạo Ticket",
          leftButton: "none",
        },
      });
      console.log("hủy btn back");
    } catch (error) {}
  };

  setNavigationBarLeftButton({
    type: "none",
    success: (res) => {
      // xử lý khi gọi api thành công
    },
    fail: (error) => {
      // xử lý khi gọi api thất bại
      console.log(error);
    },
  });
  // const Notifications = async () => {
  //   const request = require("request");
  //   const apiKey = "2j5lEkY6N6mFqt4yxurVOn7QT3tvX55Z4TjuDJ4nq6OTP-k7Gcy";
  //   const receiverId = contactData.data.zalo_id_miniapp;
  //   const miniAppId = "3077214972070612317";

  //   const url = "https://openapi.mini.zalo.me/notification/template";

  //   const data = {
  //     templateId: "00126fd75392bacce383",
  //     templateData: {
  //       buttonText: "Xem chi tiết ticket",
  //       buttonUrl: "https://zalo.me/s/3077214972070612317/",
  //       title: "Tạo mới ticket",
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

  //   request.post({ url, json: data, headers }, (error, response, body) => {
  //     if (error) {
  //       console.error(error);
  //     } else {
  //       console.log(body);
  //     }
  //   });
  // };

  useEffect(() => {
    configView();
    onConfirmToExit(() => setConfirmModalVisible(true));
    return () => offConfirmToExit();
  }, [confirmModalVisible]);

  const requestCamera = async () => {
    try {
      const { userAllow, message } = await requestCameraPermission({});
      if (userAllow) {
        // được phép sử dụng camera
      }
      console.log("requestCamera");
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  // const handleChooseImage = async () => {
  //   try {
  //     const { filePaths, tempFiles } = await chooseImage({
  //       sourceType: ["camera"],
  //       cameraType: "front",
  //     });
  //   } catch (error) {
  //     // xử lý khi gọi api thất bại
  //     console.log(error);
  //   }
  // };

  const createNewTicket = async () => {
    try {
      if (state) {
        openSnackbar({
          text: "Đang nhân đôi ticket...",
          type: "loading",
          duration: 10000,
        });
      } else {
        openSnackbar({
          text: "Đang tạo ticket...",
          type: "loading",
          duration: 10000,
        });
      }

      if (!newTicket.ticket_title || !newTicket.description) {
        setErrorMessages({
          ticket_title: !newTicket.ticket_title ? "Vui lòng nhập tiêu đề." : "",
          description: !newTicket.description ? "Vui lòng nhập mô tả." : "",
        });
        setIsFormInvalid(true);
        return;
      }

      // const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      // const isEmailValid = emailRegex.test(newTicket.contact_email);

      setErrorMessages({
        ticket_title: "",
        description: "",
      });
      setIsFormInvalid(false);
      const formData = new FormData();

      // Thêm các trường thông tin vào FormData
      formData.append("RequestAction", "SaveTicket");
      formData.append("Data[ticket_title]", newTicket.ticket_title);
      formData.append("Data[ticketpriorities]", "Normal");
      formData.append("Data[ticketstatus]", "Open");
      formData.append("Data[assigned_user_id]", "Users:1,Users:1");
      formData.append("Data[helpdesk_customer_type]", "Existing Customer");
      formData.append("Data[ticketcategories]", newTicket.ticketcategories);
      formData.append("Data[description]", newTicket.description);
      formData.append(
        "Data[helpdesk_subcategory]",
        newTicket.helpdesk_subcategory
      );
      formData.append("Data[contact_name]", newTicket.contact_name);
      formData.append("Data[contact_mobile]", newTicket.contact_mobile);
      formData.append("Data[contact_id]", contactData.data.id);
      formData.append("Data[contact_email]", newTicket.contact_email);
      // formData.append("filename", newTicket.filename[0]);
      // console.log("gghgjg", newTicket.filename[0]);
      for (let i = 0; i < newTicket.filename.length; i++) {
        formData.append(`file_${i}`, newTicket.filename[i]);
      }

      formData.append("IsMultiPartData", "1");

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: url_api,
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
        data: formData,
      };

      axios
        .request(config)
        .then((response) => {
          const createticket = JSON.stringify(response.data.data);
          console.log("đã tạo ticket thành công", createticket);
          setNewTicket({ ...initialTicketState });
          if (state) {
            openSnackbar({
              text: "Đã nhân đôi ticket thành công",
              type: "success",
            });
            navigate("/main");
          } else {
            openSnackbar({
              text: "Đã tạo ticket thành công",
              type: "success",
            });
            returnHome();
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      if (error === "SyntaxError: Unexpected token T in JSON at position 0") {
        // Xử lý lỗi
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const { ticket_title, description, ticketcategories } = newTicket;
    const isAllFieldsFilled = ticket_title && description && ticketcategories;

    setIsFieldsFilled(isAllFieldsFilled);
  }, [newTicket]);

  const handleLinkSettingChange = (e) => {
    const linkSettingValue = e.target.value;
    setInputLinkSetting(linkSettingValue);
    // Cập nhật trường description dựa trên giá trị nhập vào từ Input Link Setting
    const combinedDescription = linkSettingValue
      ? `${linkSettingValue}\n${inputDescription}`
      : inputDescription;
    setNewTicket((prevTicket) => ({
      ...prevTicket,
      description: combinedDescription,
    }));
  };

  const handleDescriptionChange = (e) => {
    const descriptionValue = e.target.value;
    setInputDescription(descriptionValue);
    // Cập nhật trường description dựa trên giá trị nhập vào từ TextArea
    const combinedDescription = `${inputLinkSetting}\n${descriptionValue}`;
    setNewTicket((prevTicket) => ({
      ...prevTicket,
      description: combinedDescription,
    }));
  };

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
      if (selectedImagesArray.length + newTicket.filename.length <= maxFiles) {
        // Cập nhật danh sách hình ảnh đã chọn
        setSelectedImages((prevSelectedImages) => [
          ...prevSelectedImages,
          ...selectedImagesArray,
        ]);

        setUploadedFiles((prevUploadedFiles) => [
          ...prevUploadedFiles,
          ...selectedImagesArray,
        ]);

        setNewTicket((prevTicket) => ({
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
    setNewTicket((prevTicket) => ({
      ...prevTicket,
      filename: updatedImagePaths,
    }));

    // Đóng hình ảnh khi người dùng xóa
    setVisible(false);

    if (index === activeIndex) {
      setActiveIndex(0);
    }
  };

  const handleIconClick = () => {
    requestCamera();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
    const selectedCategory = newTicket.ticketcategories;
    const subcategories = categoryToSubcategoryMapping[selectedCategory] || [];

    setSubcategoryOptions(subcategories);

    setNewTicket((prevTicket) => ({
      ...prevTicket,
      helpdesk_subcategory: subcategories[0] || "",
    }));
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    // Cập nhật biến isLinkSettingVisible
    setIsLinkSettingVisible(value === "Bug");
    // Cập nhật danh mục trong state newTicket
    setNewTicket((prevTicket) => ({
      ...prevTicket,
      ticketcategories: value,
    }));
  };

  useEffect(() => {
    updateSubcategories();
  }, [newTicket.ticketcategories]);

  useEffect(() => {
    newTicket.ticket_title = ticket_title;
    newTicket.ticketcategories = "Bug" || ticketcategories;
    newTicket.helpdesk_subcategory = "customer" || helpdesk_subcategory;
    newTicket.contact_name = contactData.data.full_name || contact_name;
    newTicket.contact_mobile = contactData.data.mobile || contact_mobile;
    newTicket.contact_email = contactData.data.email || contact_email;
    newTicket.description = newText;
    newTicket.imagename_path = imagename_path;
  }, []);

  const handleChange = (e) => {
    const newEmail = e.target.value;
    setNewTicket((prevTicket) => ({
      ...prevTicket,
      contact_email: newEmail,
    }));
  };

  return (
    <Page
      className="section-page"
      hideScrollbar={true}
      // restoreScrollOnBack={false}
    >
      <Box className="bgr-color">
        <Text
          style={{
            fontWeight: 500,
            padding: "16px",
          }}
        >
          Thông tin Ticket
        </Text>
        <Box
          height={1.5}
          style={{ backgroundColor: "rgba(244, 245, 246, 1)" }}
        ></Box>
        <Box className="detail-container">
          <Box>
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
                    closeOnSelect={true}
                    onChange={(value) => {
                      handleCategoryChange(value);
                      setNewTicket((prevTicket) => ({
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
                    value={newTicket[field.name]}
                    closeOnSelect={true}
                    // defaultValue={"customer" || newTicket[field.name]}
                    onChange={(value) =>
                      setNewTicket((prevTicket) => ({
                        ...prevTicket,
                        [field.name]: value,
                      }))
                    }
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
          {isLinkSettingVisible && (
            <Box mt={2}>
              <Text>Link cài đặt</Text>
              <Input
                type="text"
                helperText="Khách hàng chưa có link cài đặt có thể bỏ qua"
                placeholder="Vui lòng nhập link cài đặt"
                value={inputLinkSetting}
                onChange={handleLinkSettingChange}
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
              defaultValue={contactData.data.full_name}
              onChange={(e) => {
                setNewTicket((prevTicket) => ({
                  ...prevTicket,
                  contact_name: e.target.value,
                }));
              }}
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
                  defaultValue={contactData.data.mobile.replace(/^84/, "")}
                  // value={contactData.data.mobile.replace(/^84/, "")}
                  disabled
                  onChange={(e) => {
                    setNewTicket((prevTicket) => ({
                      ...prevTicket,
                      contact_mobile: e.target.value,
                    }));
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box mt={3}>
            <Text>Email</Text>
            <Input
              type="text"
              placeholder="Vui lòng nhập email"
              // helperText={
              //   emailValid ? null : (
              //     <span style={{ color: "red" }}>
              //       Địa chỉ email không hợp lệ
              //     </span>
              //   )
              // }
              defaultValue={contactData.data.email || newTicket.contact_email}
              onChange={handleChange}
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
          <Text>
            Mô tả <span style={{ color: "red" }}>*</span>
          </Text>
          <Input.TextArea
            placeholder="Nhập mô tả"
            status={isFormInvalid && !newTicket.description ? "error" : ""}
            errorText={errorMessages.description}
            value={inputDescription || description}
            onChange={handleDescriptionChange}
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
            Tối đa 6 file đính kèm, hỗ trợ định dạng (JPG, PNG, DOC, PDF)
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
                accept=".jpg, .jpeg, .png, .doc, .docx, .pdf"
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
                  <Box
                    m={1}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      cursor: "pointer",
                      background: "white",
                      borderRadius: "50%",
                      padding: "2px",
                    }}
                    onClick={() => {
                      handleDeleteImage(index);
                    }}
                  >
                    <Icon
                      icon="zi-delete"
                      size={16}
                      style={{ color: "rgba(0, 106, 245, 1)" }}
                    />
                  </Box>
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
          onClick={() => {
            if (isFieldsFilled) {
              setModalConfirmTicket(true);
            } else {
              setErrorMessages({
                ticket_title: !newTicket.ticket_title
                  ? "Vui lòng nhập tiêu đề."
                  : "",
                description: !newTicket.description
                  ? "Vui lòng nhập mô tả."
                  : "",
              });
              setIsFormInvalid(true);
            }
          }}
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
      <Modal
        visible={modalConfirmTicket && isFieldsFilled}
        title="Xác nhận tạo ticket"
        description="Bạn có muốn tạo ticket hay không?"
        actions={[
          {
            text: "Quay lại",
            onClick: () => {
              setModalConfirmTicket(false);
            },
          },
          {
            text: "Xác nhận",
            highLight: true,
            onClick: () => {
              createNewTicket();
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
