import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { configAppView } from "zmp-sdk/apis";
import {
  Text,
  Box,
  Page,
  useNavigate,
  Input,
  Select,
  Button,
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
  contact_name: "",
  contact_mobile: "",
  contact_id: "",
  description: "",
  helpdesk_subcategory: "",
  url: "",
};
const EditTicketPage = () => {
  const navigate = useNavigate();
  const { openSnackbar, closeSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const ticketId = queryParams.get("id");
  const token = localStorage.getItem("token");
  const [editTicket, setEditTicket] = useState({
    ...initialTicketState,
  });
  const [visible, setVisible] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailValidationResult, setEmailValidationResult] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const Detail = JSON.parse(localStorage.getItem("detail_ticket") || "{}");
  const [subcategoryOptions, setSubcategoryOptions] = useState([
    Detail.data.ticketcategories,
  ]);
  function convertFilesToImageTypes(files: File[]) {
    return files.map((file) => ({ src: URL.createObjectURL(file) }));
  }

  const [isFormInvalid, setIsFormInvalid] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    ticket_title: "",
    description: "",
    email: "",
  });
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|vn)$/;
    if (email.trim() === "") {
      return true;
    }
    setIsEmailValid(false);
    return emailRegex.test(email);
  };
  const inputEmail = (e) => {
    const newEmail = e.target.value;
    setEditTicket((prevTicket) => ({
      ...prevTicket,
      contact_email: newEmail || "",
    }));
    setEmailValidationResult(validateEmail(newEmail));
    setIsEmailValid(validateEmail(newEmail));
  };
  const text = Detail.data.description;
  const newText = text
    .replace(/<br\s*\/?>|\\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  const isImage = (file: File) => {
    return file.type.startsWith("image/");
  };
  const imagesFromImagenamePath = Object.entries(Detail.data?.imagename_path)
    .filter(
      ([id, path]) =>
        !path.toLowerCase().endsWith(".pdf") &&
        !path.toLowerCase().endsWith(".doc")
    )
    .map(([id, path]) => ({
      src: `https://pms-dev.cloudpro.vn/${path}`,
      alt: id,
    }));

  const images = uploadedFiles.filter((file) => isImage(file));
  const files = uploadedFiles.filter((file) => !isImage(file));

  const convertImage = convertFilesToImageTypes(images);
  const imagesForViewer = [...convertImage, ...imagesFromImagenamePath];

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
        text: "Đang cập nhật ticket...",
        type: "loading",
        duration: 10000,
      });

      if (
        !editTicket.ticket_title ||
        !editTicket.description ||
        !emailValidationResult
      ) {
        setErrorMessages({
          ticket_title: !editTicket.ticket_title
            ? "Vui lòng nhập tiêu đề."
            : "",
          description: !editTicket.description ? "Vui lòng nhập mô tả." : "",
          email: !emailValidationResult ? "Nhập sai định dạng email." : "",
        });
        setIsFormInvalid(true);
        return;
      }

      setErrorMessages({
        ticket_title: "",
        description: "",
        email: "",
      });
      setIsFormInvalid(false);

      const formData = new FormData();
      formData.append("RequestAction", "SaveTicket");
      formData.append("Data[id]", ticketId);
      formData.append("Data[ticket_title]", editTicket.ticket_title);
      formData.append("Data[ticketcategories]", editTicket.ticketcategories);
      formData.append(
        "Data[helpdesk_subcategory]",
        editTicket.helpdesk_subcategory
      );
      // formData.append("Data[imgDelete]", true);
      // formData.append("Data[imgDeleteIds]", JSON.stringify([518960, 518961]));
      formData.append("Data[url]", editTicket.url);
      formData.append("Data[description]", editTicket.description);
      formData.append("Data[contact_email]", editTicket.contact_email);
      formData.append("Data[contact_name]", editTicket.contact_name);
      formData.append("Data[contact_mobile]", editTicket.contact_mobile);
      for (let i = 0; i < editTicket.filename.length; i++) {
        formData.append(`file_${i}`, editTicket.filename[i]);
      }

      formData.append("IsMultiPartData", "1");

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
      setEditTicket({ ...initialTicketState });
      openSnackbar({
        text: "Ticket đã được cập nhật",
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

  const maxFileSizeInBytes = 15 * 1024 * 1024;
  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const selectedImagesArray = Array.from(files);
      console.log("files đã chọn:", files);

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
        filename: files ? [...files] : [],
      }));

      setEditTicket((prevTicket) => ({
        ...prevTicket,
        filename: prevTicket.filename.concat(selectedImagesArray),
      }));
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

  const handleUploadFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".docx")) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/.docx_icon.svg/2048px-.docx_icon.svg.png";
    } else if (fileName.endsWith(".pdf")) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Pdf-2127829.png/600px-Pdf-2127829.png";
    } else {
      // Nếu không phải là file pdf hoặc docx, trả về null hoặc ảnh mặc định khác
      return null;
    }
  };

  useEffect(() => {
    editTicket.ticket_title = Detail.data.ticket_title || "";
    editTicket.ticketcategories = Detail.data.ticketcategories || "";
    editTicket.helpdesk_subcategory = Detail.data.helpdesk_subcategory || "";
    editTicket.url = Detail.data.url || "";
    editTicket.contact_email = Detail.data.contact_email || "";
    editTicket.contact_mobile =
      Detail.data.contact_mobile.replace(/^84/, "0") || "";
    editTicket.description = newText || "";
    editTicket.filename = Detail.data?.imagename_path || "";
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
    setEditTicket((prevTicket) => ({
      ...prevTicket,
      ticketcategories: value,
    }));
  };

  useEffect(() => {
    updateSubcategories();
  }, [editTicket.ticketcategories]);

  const imagenamePathArray = Object.entries(Detail.data?.imagename_path)
    .map(([id, path]) => ({ id, path }))
    .filter(
      ({ path }) =>
        !path.toLowerCase().endsWith(".pdf") &&
        !path.toLowerCase().endsWith(".doc")
    );

  const filePathArray = Object.entries(Detail.data?.imagename_path)
    .map(([id, path]) => ({ id, path }))
    .filter(
      ({ path }) =>
        path.toLowerCase().endsWith(".pdf") ||
        path.toLowerCase().endsWith(".doc")
    );

  const allImages = [...images, ...imagenamePathArray];
  const allFiles = [...files, ...filePathArray];
  return (
    <Page className="section-page" hideScrollbar={true} resetScroll={false}>
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
            <Text>
              Tiêu đề <span style={{ color: "red" }}>*</span>
            </Text>
            <Input
              type="text"
              status={isFormInvalid && !editTicket.ticket_title ? "error" : ""}
              errorText={errorMessages.ticket_title}
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
          <Box mt={3}>
            <Text>Link cài đặt</Text>
            <Input
              type="text"
              placeholder="link mẫu: htths://pms.cloudgo.vn"
              value={editTicket.url}
              onChange={(e) => {
                setEditTicket((prevTicket) => ({
                  ...prevTicket,
                  url: e.target.value,
                }));
              }}
              // value={inputLinkSetting}
              // onChange={handleLinkSettingChange}
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
            status={isFormInvalid && !editTicket.description ? "error" : ""}
            errorText={errorMessages.description}
            value={editTicket.description}
            onChange={(e) => {
              setEditTicket((prevTicket) => ({
                ...prevTicket,
                description: e.target.value,
              }));
            }}
            // value={inputDescription}
            // style={{ whiteSpace: "pre-wrap" }}
            // onChange={handleDescriptionChange}
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
          <Box
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            onClick={handleUploadFile}
            style={{
              borderRadius: "8px",
              border: "2px dashed rgba(0, 106, 245, 1)",
              padding: "12px",
            }}
          >
            <Icon
              icon="zi-upload"
              size={32}
              style={{ color: "rgba(118, 122, 127, 1)" }}
            ></Icon>
            <Text style={{ fontSize: "10px", marginTop: "4px" }}>
              Hỗ trợ định dạng JPG, PNG, PDF, DOC. Dung lượng tối đa 15MB
            </Text>
            <Text style={{ color: "red", fontSize: "10px" }}>
              Chú ý: File đính kèm sẽ bị thay thế
            </Text>
          </Box>
          <Box flexDirection="row" mt={3} className="image-list-container">
            <Box>
              <input
                type="file"
                accept=".jpg, .jpeg, .png, .doc, .docx, .pdf"
                onChange={(e) => handleImageUpload(e.target.files)}
                multiple
                style={{ display: "none" }}
                ref={fileInputRef}
              />
            </Box>
            <>
              {allImages.map((image, index) => (
                <div
                  key={index}
                  style={{ marginLeft: "10px", textAlign: "center" }}
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <div
                      style={{
                        width: "96px",
                        height: "96px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        onClick={() => {
                          setActiveIndex(index);
                          setVisible(true);
                        }}
                        src={
                          image instanceof File
                            ? URL.createObjectURL(image)
                            : `https://pms-dev.cloudpro.vn/${image.path}`
                        }
                        alt={`Hình ảnh ${index}`}
                        style={{
                          width: "96px",
                          height: "96px",
                          cursor: "pointer",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    </div>

                    {/* <Box
                      m={1}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        handleDeleteImage(index);
                      }}
                    >
                      <Icon
                        icon="zi-close-circle-solid"
                        size={24}
                        style={{ color: "rgba(118, 122, 127, 1)" }}
                      />
                    </Box> */}
                  </div>
                </div>
              ))}
            </>
          </Box>
          <ul
            style={{
              paddingTop: "8px",
              listStyleType: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {allFiles.map((file, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                <Box
                  pl={2}
                  pr={2}
                  height={48}
                  width={230}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: "8px",
                    border: "1px rgba(233, 235, 237, 1) solid ",
                  }}
                >
                  {getFileIcon(file.name || file.path) && (
                    <img
                      src={getFileIcon(file.name || file.path)}
                      alt={`File ${index + 1}`}
                      style={{
                        height: "24px",
                        width: "24px",
                        marginRight: "8px",
                      }}
                    />
                  )}
                  <span
                    style={{
                      width: "170px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                    }}
                  >
                    {file.name || file.path.split("/").pop()}
                  </span>
                  <div
                    onClick={() => {
                      handleDeleteImage(index);
                    }}
                    style={{ cursor: "pointer", marginLeft: "8px" }}
                  >
                    <Icon size={18} icon="zi-close-circle-solid" />
                  </div>
                </Box>
              </li>
            ))}
          </ul>
          <ImageViewer
            onClose={() => setVisible(false)}
            activeIndex={activeIndex}
            images={imagesForViewer}
            visible={visible}
          ></ImageViewer>
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
              style={{
                backgroundColor: "rgba(244, 245, 246, 1)",
              }}
              value={Detail.data?.contact_name}
            />
          </Box>
          <Box mt={3}>
            <Text>Di động</Text>
            <Input
              style={{
                backgroundColor: "rgb(248, 249, 249)",
              }}
              type="text"
              disabled
              value={editTicket.contact_mobile}
            />
          </Box>
          <Box>
            <Text>Công ty</Text>
            <Input
              style={{
                backgroundColor: "rgb(248, 249, 249)",
              }}
              type="text"
              disabled
              defaultValue={Detail.data?.parent_name}
            />
          </Box>
          <Box mt={3}>
            <Text>Email</Text>

            <Input
              placeholder="Vui lòng nhập email"
              value={
                editTicket.contact_email !== undefined
                  ? editTicket.contact_email
                  : Detail.data.contact_email || ""
              }
              onChange={inputEmail}
              status={isFormInvalid && !emailValidationResult ? "error" : ""}
              errorText={errorMessages.email}
            />
          </Box>
        </Box>
      </Box>

      <Box mt={2} className="section-container">
        <Button
          fullWidth
          style={{ borderRadius: "8px" }}
          onClick={() => {
            if (isEmailValid) {
              EditTicket(ticketId);
            } else {
              setErrorMessages({
                ticket_title: !editTicket.ticket_title
                  ? "Vui lòng nhập tiêu đề."
                  : "",
                description: !editTicket.description
                  ? "Vui lòng nhập mô tả."
                  : "",
                email: !emailValidationResult
                  ? "Nhập sai định dạng email."
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
