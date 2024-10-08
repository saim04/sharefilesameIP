import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faDownload,
  faFileAlt,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const App = () => {
  const [callApi, setCallApi] = useState(false);
  const [displayFiles, setDisplayFiles] = useState([]);
  const [select, setSelect] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const handleFiles = async (e) => {
    e.preventDefault();
    const selectedFiles = Array.from(e.target.files);

    let formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append(`files`, file);
    });

    try {
      await axios.post("https://sharefilesame-ip.vercel.app/upload", formData);
      setTimeout(() => {}, 2000);
      setCallApi(!callApi);
    } catch (error) {
      alert("Error uploading files.");
    }
  };

  const handleUpload = () => {
    inputRef.current.click();
  };

  const deleteAll = async () => {
    try {
      if (window.confirm("Are you sure you want to delete all files")) {
        await axios.delete("https://sharefilesame-ip.vercel.app/deleteAll");
        setCallApi(!callApi);
      }
    } catch (error) {
      alert("Error Deleting Files.");
    }
  };

  const deleteSingle = async (name) => {
    if (selectedFiles.length > 0) {
      let filenames = [];
      selectedFiles.forEach((df) => {
        filenames.push({ name: df.name, _id: df._id });
      });
      try {
        await axios.post(`https://sharefilesame-ip.vercel.app/delete`, {
          filenames: filenames,
        });
        setCallApi(!callApi);
        deSelect();
      } catch (error) {
        alert("Error Deleting Files.");
      }
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await axios.get(file.path, {
        responseType: "blob",
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalname || "file"); // Set the file name
      document.body.appendChild(link);
      link.click();

      // Clean up the URL object
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error downloading the file");
    }
  };

  const downloadAll = async () => {
    let filenames = [];
    if (select && selectedFiles.length > 0) {
      selectedFiles.forEach((df) => {
        filenames.push({ path: df.path, originalname: df.originalname });
      });
      setSelectedFiles([]);
    } else {
      displayFiles.forEach((df) => {
        filenames.push({ path: df.path, originalname: df.originalname });
      });
    }

    try {
      const res = await axios.post(
        "https://sharefilesame-ip.vercel.app/downloadall",
        { filenames: filenames },
        { responseType: "blob" }
      );
      deSelect();
      window.location.href = URL.createObjectURL(res.data);
    } catch (error) {
      console.log(error.message);
      alert("Error Downloading Files.");
    }
  };

  const selectSingle = (file) => {
    if (select) {
      let a = [];
      displayFiles.forEach((f) => {
        if (file._id === f._id) {
          f.checked = !f.checked;
        }
        if (f.checked) {
          a.push(f);
        }
      });
      setSelectedFiles([...a]);
      setDisplayFiles([...displayFiles]);
    } else {
      console.log("clicked");
      return null;
    }
  };

  const deSelect = () => {
    setSelect(false);

    displayFiles.forEach((f) => {
      f.checked = false;
    });

    setDisplayFiles([...displayFiles]);
  };
  useEffect(() => {
    setLoading(true);
    const getFiles = async () => {
      let res = await axios.get("https://sharefilesame-ip.vercel.app/get");
      setDisplayFiles(res.data.files);

      setLoading(false);
    };

    getFiles();
  }, [callApi]);

  return (
    <>
      <div className="main">
        <div className="appbox__main">
          <div className="appbox">
            <div className="head">
              <div>
                <h1>Files</h1>
              </div>
              {displayFiles.length === 0 ? (
                ""
              ) : (
                <div className="buttons">
                  {select ? (
                    <p onClick={deSelect}>Cancel</p>
                  ) : (
                    <p onClick={() => setSelect(!select)}>Select</p>
                  )}
                  <p onClick={downloadAll}>
                    <FontAwesomeIcon icon={faDownload} />
                    <span>Download all</span>
                  </p>
                  {!select ? (
                    <p onClick={deleteAll} style={{ color: "red" }}>
                      <FontAwesomeIcon icon={faTrash} />
                      <span>Delete all</span>
                    </p>
                  ) : (
                    <p onClick={deleteSingle} style={{ color: "red" }}>
                      <FontAwesomeIcon icon={faTrash} />
                      <span>Delete</span>
                    </p>
                  )}
                </div>
              )}
            </div>
            {!loading ? (
              <div
                className={`files ${
                  displayFiles.length === 0 ? `dashed` : ""
                } `}
              >
                {displayFiles.length === 0 ? (
                  <div className="text">
                    <input
                      type="file"
                      style={{ display: "none" }}
                      ref={inputRef}
                      onChange={handleFiles}
                      multiple
                    />
                    <span onClick={handleUpload}>Browse</span> files to upload
                    and share with same internet users.
                    <p
                      style={{
                        fontSize: "10px",
                        textAlign: "center",
                        marginTop: "10px",
                      }}
                    >
                      Max File size should be 10MB, Some formats are not
                      supported.
                    </p>
                  </div>
                ) : (
                  <div className="displayfiles ">
                    {displayFiles.map((f) => {
                      return (
                        <div
                          style={{ width: "120px", height: "120px" }}
                          key={f._id}
                          onClick={() => selectSingle(f)}
                        >
                          {f.type.includes("image") ? (
                            <a
                              onClick={() => (!select ? handleDownload(f) : "")}
                              href="#"
                              className={` ${select ? "selecting" : ""} image`}
                              style={{
                                display: "block",
                                backgroundImage: `url(${f.path})`,
                                width: "120px",
                                height: "120px",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                backgroundSize: "cover",
                              }}
                            >
                              {select ? (
                                <div
                                  className={`${f.checked ? `Ticked` : `Tick`}`}
                                >
                                  <FontAwesomeIcon
                                    style={{
                                      fontSize: "2rem",
                                      opacity: `${f.checked ? 0.8 : 0.4}`,
                                    }}
                                    icon={faCheck}
                                  />
                                </div>
                              ) : (
                                ""
                              )}
                            </a>
                          ) : (
                            <a
                              className={`singleFile ${
                                select ? "selecting" : ""
                              } `}
                              onClick={() => (!select ? handleDownload(f) : "")}
                              href="#"
                            >
                              <FontAwesomeIcon
                                style={{ fontSize: "2.8rem" }}
                                icon={faFileAlt}
                              />
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  maxWidth: "80px",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                  display: "inline-block",
                                }}
                              >
                                {f.originalname}
                              </span>
                              {console.log(f.checked)}
                              {select ? (
                                <div
                                  className={`${f.checked ? `Ticked` : `Tick`}`}
                                >
                                  <FontAwesomeIcon
                                    style={{
                                      fontSize: "2rem",
                                      opacity: `${f.checked ? 0.8 : 0.4}`,
                                    }}
                                    icon={faCheck}
                                  />
                                </div>
                              ) : (
                                ""
                              )}
                            </a>
                          )}
                        </div>
                      );
                    })}
                    <div
                      onClick={handleUpload}
                      className="displayfiles__upload"
                    >
                      <input
                        type="file"
                        style={{ display: "none" }}
                        ref={inputRef}
                        onChange={handleFiles}
                        multiple
                      />
                      <FontAwesomeIcon
                        style={{ fontSize: "1.5rem" }}
                        icon={faPlus}
                      />
                      <p>Add File</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="loader"></div>
            )}
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            color: "rgb(189, 189, 189)",
            padding: "40px",
          }}
        >
          <p>Made with ❤️ by Saim Fayyaz.</p>
        </div>
      </div>
    </>
  );
};

export default App;
