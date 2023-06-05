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
      await addDoc(messagesRef, {
        senderEmail: currentUser.email,
        receiverEmail: chat.email,
        receiverName: chat.name,
        createdAt: serverTimestamp(),
        text: message,
      });
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
          height: 600,
          maxHeight: 600,
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
                    maxWidth: "80%",
                    overflowWrap: "anywhere",
                    overflow: "auto",
                    marginTop: 5,
                  }}
                >
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
                    backgroundColor: "#E8E8E8",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
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
                    maxWidth: "80%",
                    overflowWrap: "anywhere",
                    overflow: "auto",
                    marginTop: 5,
                  }}
                >
                  <p
                    style={{
                      color: "black",
                    }}
                  >
                    {message.text}
                  </p>
                </div>
              );
            }
          })}
        </Box>
        <Box display={"flex"} gap={2} width={"100%"} marginTop={"auto"}>
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
