import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
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
import { TicketType } from "../../type";
import url_api from "../../service";
import { useService } from "../../functions/common";
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
  url: "",
  helpdesk_subcategory: "",
};
const CreateTicketPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const {
    ticket_title,
    ticketcategories,
    helpdesk_subcategory,
    id,
    contact_name,
    contact_mobile,
    contact_email,
    parent_name,
    description,
    url,
    imagename_path,
  } = state ?? [];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const contactData = JSON.parse(localStorage.getItem("contact") || "{}");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { openSnackbar, closeSnackbar } = useSnackbar();
  const [selectedCategory, setSelectedCategory] = useState("");
  const token = localStorage.getItem("token");
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [modalConfirmTicket, setModalConfirmTicket] = useState(false);
  const [isFieldsFilled, setIsFieldsFilled] = useState<string | boolean>("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailValidationResult, setEmailValidationResult] = useState(true);
  const [newTicket, setNewTicket] = React.useState<TicketType>({
    ...initialTicketState,
  });
  const [isFormInvalid, setIsFormInvalid] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    ticket_title: "",
    description: "",
    email: "",
  });
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { configView, setLeftButton } = useService();

  //Convert từ array file thành src
  function convertFilesToImageTypes(files: File[]) {
    return files.map((file) => ({ src: URL.createObjectURL(file) }));
  }

  //Check file có phải là image hay không?
  const isImage = (file: File) => {
    return file.type.startsWith("image/");
  };

  //Tạo biến để chứa image và file
  let images = uploadedFiles.filter((file) => isImage(file));
  let files = uploadedFiles.filter((file) => !isImage(file));

  /**
   * Tạo biến để convert từ file image => src image
   * Truyền src này vào src ở component ImageForViewer để preview image
   */
  const imagesForViewer = convertFilesToImageTypes(images);

  //Hàm check validateEmail
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|vn)$/;
    if (email.trim() === "") {
      setIsEmailValid(true);
      return true;
    }
    const isValid = emailRegex.test(email);
    setIsEmailValid(isValid);
    return isValid;
  };

  useEffect(() => {
    configView("Tạo ticket", "back");
    setLeftButton("back");
  }, []);

  /**
   * @param ticket_title | ticketpriorities | ticketstatus | assigned_user_id | helpdesk_customer_type | id | ticketcategories | url | description | helpdesk_subcategory | contact_name | contact_email | contact_mobile | file
   * @returns thông tin newTicket
   */
  const createNewTicket = async () => {
    try {
      //Alert hiển thị trạng thái đang edit || tạo ticket
      if (id) {
        openSnackbar({
          text: "Đang cập nhật ticket...",
          type: "loading",
          duration: 5000,
        });
      } else {
        openSnackbar({
          text: "Đang tạo ticket...",
          type: "loading",
          duration: 5000,
        });
      }

      if (!newTicket.ticket_title || !newTicket.description || !isEmailValid) {
        setErrorMessages({
          ticket_title: !newTicket.ticket_title ? "Vui lòng nhập tiêu đề." : "",
          description: !newTicket.description ? "Vui lòng nhập mô tả." : "",
          email: !isEmailValid ? "Nhập sai định dạng email." : "",
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

      setModalConfirmTicket(true);
      const formData = new FormData();

      formData.append("RequestAction", "SaveTicket");
      formData.append("Data[ticket_title]", newTicket.ticket_title);
      formData.append("Data[ticketpriorities]", "Normal");
      formData.append("Data[ticketstatus]", "Open");
      formData.append("Data[assigned_user_id]", "Users:1,Users:1");
      formData.append("Data[helpdesk_customer_type]", "Existing Customer");
      formData.append("Data[id]", id || "");
      formData.append("Data[ticketcategories]", newTicket.ticketcategories);
      formData.append("Data[url]", newTicket.url);
      formData.append("Data[description]", newTicket.description);
      formData.append(
        "Data[helpdesk_subcategory]",
        newTicket.helpdesk_subcategory
      );
      formData.append("Data[contact_name]", newTicket.contact_name);
      formData.append("Data[contact_mobile]", newTicket.contact_mobile);
      formData.append("Data[contact_id]", contactData.data?.id);
      formData.append("Data[contact_email]", newTicket.contact_email);
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
        .then(() => {
          // Update state cho các field trong initialTicketState
          setNewTicket({ ...initialTicketState });
          closeSnackbar();

          if (id) {
            openSnackbar({
              text: "Ticket đã được cập nhật",
              type: "success",
              duration: 2000,
            });
          }

          if (id) {
            navigate(-1);
          } else {
            navigate("/tickets/confirm");
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

  //Kiểm tra các field đã điền đầy đủ thông tin chưa
  useEffect(() => {
    const { ticket_title, description, ticketcategories } = newTicket;
    const isAllFieldsFilled = ticket_title && description && ticketcategories;

    setIsFieldsFilled(isAllFieldsFilled);
  }, [newTicket]);

  // Hàm upload file
  const maxFileSizeInBytes = 15 * 1024 * 1024;
  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const selectedImagesArray = Array.from(files);

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

      // Cập nhật danh sách file đã chọn
      setUploadedFiles((prevUploadedFiles) => [
        ...prevUploadedFiles,
        ...selectedImagesArray,
      ]);

      // Set state filename là danh sách các file đã chọn
      setNewTicket((prevTicket) => ({
        ...prevTicket,
        filename: prevTicket.filename.concat(selectedImagesArray),
      }));
    }
  };

  // Hàm delete image khi đã upload
  const handleDeleteImage = (index) => {
    // update lại danh sách image đã upload
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);

    // update lại danh sách file đã upload
    const updatedUploadedFiles = [...uploadedFiles];
    updatedUploadedFiles.splice(index, 1);
    setUploadedFiles(updatedUploadedFiles);

    // convert các array file còn lại thành src
    const updatedImagePaths = updatedImages.map((file) =>
      URL.createObjectURL(file)
    );

    // set state filename là array src sau khi update
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

  // Hàm delete file pdf || docx
  const handleDeleteFile = (index) => {
    // update lại file khi upload
    const updatedFiles = [...uploadedFiles];
    const deletedFile = updatedFiles.splice(index, 1)[0];

    if (isImage(deletedFile)) {
      // Nếu là hình ảnh, chỉ cập nhật danh sách hình ảnh
      setSelectedImages(updatedFiles.filter(isImage));
    }
    setUploadedFiles(updatedFiles);

    // convert các array file còn lại thành src
    const updatedImagePaths = updatedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    // set state filename là array src sau khi update
    setNewTicket((prevTicket) => ({
      ...prevTicket,
      filename: updatedImagePaths,
    }));
  };

  // Hàm để mở thư viện upload file
  const handleUploadFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // check nếu là file pdf || docx thì hiển thị img tương tự
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

  //Mapping chi tiết danh mục theo danh mục
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

  // Update chi tiết chi mục
  const updateSubcategories = () => {
    const selectedCategory = newTicket.ticketcategories;
    const subcategories = categoryToSubcategoryMapping[selectedCategory] || [];
    setSubcategoryOptions(subcategories);

    setNewTicket((prevTicket) => ({
      ...prevTicket,
      helpdesk_subcategory: subcategories[0] || "",
    }));
  };

  // Hàm select danh mục
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setNewTicket((prevTicket) => ({
      ...prevTicket,
      ticketcategories: value,
    }));
  };

  //Chạy useEffect này để set default value cho các field trong trường hợp edit ticket
  useEffect(() => {
    const text = description?.replace(/<br\s*\/?>/g, "") || "";
    newTicket.ticket_title = ticket_title || "";
    newTicket.ticketcategories = ticketcategories || "Bug";
    newTicket.helpdesk_subcategory = helpdesk_subcategory || "customer";
    newTicket.url = url || "";
    newTicket.contact_name = contact_name || contactData.data?.full_name || "";
    newTicket.contact_email = contact_email || contactData.data?.email || "";
    newTicket.contact_mobile = contact_mobile || contactData.data?.mobile || "";
    newTicket.description = text || "";
    newTicket.filename = imagename_path || "";
  }, []);

  //Chạy useEffect để thay đổi chi tiết danh mục
  useEffect(() => {
    updateSubcategories();
  }, [newTicket.ticketcategories]);

  // Input email
  const inputEmail = (e) => {
    const newEmail = e.target.value;
    setNewTicket((prevTicket) => ({
      ...prevTicket,
      contact_email: newEmail || "",
    }));
    setEmailValidationResult(validateEmail(newEmail));
  };

  return (
    <div style={{ overflowY: "auto", height: "100vh" }}>
      <Page className="section-page" hideScrollbar={true} resetScroll={false}>
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

            <Box mt={2}>
              <Text>Link cài đặt</Text>

              <Input
                type="text"
                helperText="Khách hàng chưa có link cài đặt có thể bỏ qua"
                placeholder="link mẫu: https://pms.cloudgo.vn"
                // value={newTicket.url}
                defaultValue={
                  contactData.data?.url || `https://${newTicket.url}`
                }
                onChange={(e) => {
                  setNewTicket((prevTicket) => ({
                    ...prevTicket,
                    url: e.target.value,
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
            <Text>
              Mô tả <span style={{ color: "red" }}>*</span>
            </Text>
            <Input.TextArea
              placeholder="Nhập mô tả"
              status={isFormInvalid && !newTicket.description ? "error" : ""}
              errorText={errorMessages.description}
              value={newTicket.description}
              onChange={(e) => {
                setNewTicket((prevTicket) => ({
                  ...prevTicket,
                  description: e.target.value,
                }));
              }}
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
                  accept=".jpg, .png, .docx, .pdf"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  multiple
                  style={{ display: "none" }}
                  ref={fileInputRef}
                />
              </Box>
              <>
                {images.map((image, index) => {
                  return isImage(image) ? (
                    <div
                      key={index}
                      style={{ marginLeft: "10px", textAlign: "center" }}
                    >
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
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
                                : `https://pms-dev.cloudpro.vn/${image}`
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

                        <Box
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
                        </Box>
                      </div>
                    </div>
                  ) : (
                    <div />
                  );
                })}
              </>
            </Box>
            <Box
              flex
              flexDirection="row"
              style={{
                overflowX: "auto",
              }}
            >
              {files.map((file, index) => {
                return !isImage(file) ? (
                  <li
                    key={index}
                    style={{
                      marginBottom: "8px",
                      marginRight: "12px",
                      display: "inline-block",
                    }}
                  >
                    <Box
                      pl={2}
                      pr={2}
                      height={48}
                      width={230}
                      justifyContent="space-between"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: "8px",
                        border: "1px rgba(233, 235, 237, 1) solid ",
                      }}
                    >
                      <Box flexDirection="row" alignContent="center">
                        {getFileIcon(file.name) && (
                          <img
                            src={getFileIcon(file.name)}
                            alt={`File ${index + 1}`}
                            style={{
                              height: "28px",
                              width: "28px",
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
                          {file.name}
                        </span>
                      </Box>

                      <div
                        onClick={() => {
                          console.log(index);
                          handleDeleteFile(index);
                        }}
                        style={{ cursor: "pointer", marginLeft: "8px" }}
                      >
                        <Icon size={18} icon="zi-close-circle-solid" />
                      </div>
                    </Box>
                  </li>
                ) : (
                  <div></div>
                );
              })}
            </Box>

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
                style={{
                  backgroundColor: "rgb(248, 249, 249)",
                }}
                type="text"
                disabled
                defaultValue={userInfo.name}
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
                defaultValue={
                  contactData.data?.mobile.replace(/^84/, "0") || ""
                }
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
                defaultValue={contactData.data?.account_name}
              />
            </Box>
            <Box mt={3}>
              <Text>Email</Text>
              <Input
                type="text"
                placeholder="Vui lòng nhập email"
                value={newTicket.contact_email}
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
              if (isFieldsFilled && isEmailValid) {
                setModalConfirmTicket(true);
              } else {
                setErrorMessages({
                  ticket_title: !newTicket.ticket_title
                    ? "Vui lòng nhập tiêu đề."
                    : "",
                  description: !newTicket.description
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
    </div>
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