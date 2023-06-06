import React, {useEffect, useState, useRef} from "react";
import {useLocation} from "react-router-dom";
import {Container, Box, Typography, TextField, Button} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {useNavigate} from "react-router-dom";
import {signOut} from "firebase/auth";
import {auth, db} from "../../firebase/config";
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
import {getDocs, onSnapshot, orderBy, query} from "firebase/firestore";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Chat = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const {chat, index} = location.state;
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState();
  const messagesContainerRef = useRef(null);
  const [replyToText, setReplyToText] = useState({id: "", text: ""});

  const handleReply = (messageText, messageId) => {
    setReplyToText({
      id: messageId,
      text: messageText,
    });
  };

  const handleLogout = async () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        await signOut(auth)
          .then(() => {
            setLoading(false);
            navigate("/login");
            localStorage.removeItem("chat-app-user");
          })
          .catch((error) => {
            setLoading(false);
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    }, 2000);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesRef = collection(db, "messages");
      const getUser = localStorage.getItem("chat-app-user");
      const currentUser = JSON.parse(getUser);

      let unsubscribe = null;
      if (currentUser?.email === chat.email || chat.email === chat.email) {
        unsubscribe = onSnapshot(
          query(collection(db, "messages"), orderBy("createdAt", "asc")),
          (snapshot) => {
            const fetchedMessages = snapshot.docs
              .map((doc) => {
                if (
                  (chat.email === doc.data().receiverEmail &&
                    currentUser?.email === doc.data().senderEmail) ||
                  (chat.email === doc.data().senderEmail &&
                    currentUser?.email === doc.data().receiverEmail)
                ) {
                  return {
                    ...doc.data(),
                    text: doc.data().text,
                    createdAt: doc.data().createdAt?.toDate(),
                  };
                }
                return null;
              })
              .filter(Boolean);

            setMessages(fetchedMessages);

            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight;
            }
          }
        );
      } else {
        const snapshot = await getDocs(
          query(collection(db, "messages"), orderBy("createdAt", "asc"))
        );
        const messages = snapshot.docs
          .map((doc) => {
            if (
              (chat.email === doc.data().receiverEmail &&
                currentUser?.email === doc.data().senderEmail) ||
              (chat.email === doc.data().senderEmail &&
                currentUser?.email === doc.data().receiverEmail)
            ) {
              return {
                ...doc.data(),
                text: doc.data().text,
                createdAt: doc.data().createdAt?.toDate(),
              };
            }
            return null;
          })
          .filter(Boolean);

        setMessages(messages);

        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    };

    fetchMessages();
  }, [chat.email]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    try {
      setMessage("");
      const messagesRef = collection(db, "messages");
      const getUser = localStorage.getItem("chat-app-user");
      const currentUser = JSON.parse(getUser);
      console.log(currentUser);
      if (replyToText.text !== "") {
        await addDoc(messagesRef, {
          senderEmail: currentUser.email,
          receiverEmail: chat.email,
          receiverName: chat.name,
          createdAt: serverTimestamp(),
          text: message,
          id: Date.now().toString(),
          replyTo: {
            id: replyToText.id,
            text: replyToText.text,
          },
        });
        setReplyToText({id: "", text: ""});
      } else {
        await addDoc(messagesRef, {
          senderEmail: currentUser.email,
          receiverEmail: chat.email,
          receiverName: chat.name,
          createdAt: serverTimestamp(),
          text: message,
          id: Date.now().toString(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <ToastContainer />
      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        paddingLeft={8}
        paddingRight={8}
        height={60}
        backgroundColor={"gray"}
      >
        <Typography variant="h4" color={"white"} fontWeight={600}>
          Chat App
        </Typography>
        {loading ? (
          <CircularProgress color="inherit" />
        ) : (
          <Button
            variant="contained"
            style={{height: 40}}
            onClick={() => handleLogout()}
          >
            Logout
          </Button>
        )}
      </Box>
      <Container
        maxWidth="md"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          marginTop: "1%",
          border: "2px solid lightgrey",
          borderRadius: 10,
          paddingTop: 20,
          paddingBottom: 20,
          width: "100%",
          height: "87vh",
          // maxHeight: 600,
        }}
      >
        <Typography variant="h4">{chat.name}</Typography>
        <Box
          width={"100%"}
          height={"100%"}
          overflow={"auto"}
          ref={messagesContainerRef}
        >
          {messages?.map((message, index) => {
            const getUser = localStorage.getItem("chat-app-user");
            const currentUser = JSON.parse(getUser);
            if (message.senderEmail === currentUser.email) {
              return (
                <div
                  style={{
                    backgroundColor: "#3580FF",
                    display: "flex",
                    justifyContent: "flex-end",
                    flexDirection: "column",
                    alignItems: "center",
                    marginLeft: "auto",
                    borderRadius: 10,
                    width: "fit-content",
                    paddingRight: 10,
                    paddingLeft: 10,
                    marginRight: 13,
                    height: "auto",
                    width: "fit-content",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    flexWrap: "wrap",
                    maxWidth: "50%",
                    overflowWrap: "anywhere",
                    overflow: "auto",
                    marginTop: 5,
                  }}
                >
                  {message?.replyTo?.text && (
                    <p
                      style={{
                        backgroundColor: "#E8E8E8",
                        color: "black",
                        paddingLeft: 2,
                        paddingRight: 2,
                        borderRadius: 4,
                        marginBottom: -10,
                        alignSelf: "flex-start",
                      }}
                    >
                      Replied To: {message?.replyTo?.text}
                    </p>
                  )}
                  <p
                    style={{
                      color: "white",
                    }}
                  >
                    {message.text}
                  </p>
                </div>
              );
            } else {
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#E8E8E8",
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      flexDirection: "column",
                      marginRight: "auto",
                      borderRadius: 10,
                      paddingLeft: 10,
                      paddingRight: 10,
                      marginRight: 13,
                      height: "auto",
                      width: "fit-content",
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      flexWrap: "wrap",
                      maxWidth: "50%",
                      overflowWrap: "anywhere",
                      overflow: "auto",
                      marginTop: 5,
                    }}
                  >
                    {message?.replyTo?.text && (
                      <p
                        style={{
                          backgroundColor: "#3580FF",
                          color: "white",
                          paddingLeft: 2,
                          paddingRight: 2,
                          borderRadius: 4,
                          marginBottom: -10,
                          alignSelf: "flex-start",
                        }}
                      >
                        Replied To: {message?.replyTo?.text}
                      </p>
                    )}

                    <p
                      style={{
                        color: "black",
                      }}
                    >
                      {message.text}
                    </p>
                  </div>
                  <button
                    onClick={() => handleReply(message.text, message.id)}
                    style={{
                      height: 28,
                      backgroundColor: "#3580FF",
                      color: "white",
                      borderRadius: 10,
                      border: "none",
                    }}
                  >
                    Reply
                  </button>
                </div>
              );
            }
          })}
        </Box>
        <Box
          display={"flex"}
          width={"100%"}
          marginTop={"auto"}
          gap={replyToText.text !== "" ? 0 : 2}
          flexDirection={replyToText.text !== "" ? "column" : "row"}
        >
          {replyToText.text !== "" && (
            <Container
              style={{
                border: "1px solid black",
                borderBottom: "none",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                display: "flex",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <Box>
                <Typography
                  style={{color: "#3580FF", fontWeight: 900, fontSize: 18}}
                >
                  Reply To: &nbsp;{" "}
                </Typography>
                <Typography
                  style={{
                    width: "fit-content",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    flexWrap: "wrap",
                    maxWidth: "100%",
                    overflowWrap: "anywhere",
                    overflow: "auto",
                  }}
                >
                  {replyToText.text}
                </Typography>
              </Box>
              <Box>
                <Button
                  onClick={() => setReplyToText({id: "", text: ""})}
                  size="small"
                  style={{alignSelf: "flex-end"}}
                  variant="contained"
                >
                  x
                </Button>
              </Box>
            </Container>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            inputProps={{
              style: {
                width: "100%",
                maxHeight: "100%",
                overflow: "auto",
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => sendMessage()}
            style={{height: 50, alignSelf: "flex-end"}}
          >
            Send
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default Chat;
