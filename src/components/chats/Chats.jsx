import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Container, Box, Typography, TextField, Button} from "@mui/material";
import {signOut} from "firebase/auth";
import {auth, db} from "../../firebase/config";
import CircularProgress from "@mui/material/CircularProgress";
import {
  getDocs,
  collection,
  doc,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import SupervisedUserCircle from "@mui/icons-material/SupervisedUserCircle";

const Chats = () => {
  const navigate = useNavigate();
  const [loggedInUser, setLogginInUser] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [chats, setChats] = useState();

  useEffect(() => {
    const user = localStorage.getItem("chat-app-user");
    if (!user) {
      navigate("/login");
    } else {
      setLogginInUser(user);
    }
  }, []);

  useEffect(() => {
    fetchAllChats();
  }, [loggedInUser]);

  const fetchAllChats = async () => {
    setLoadingChats(true);
    try {
      const query = await getDocs(collection(db, "users"));
      const getUser = localStorage.getItem("chat-app-user");
      const currentUser = JSON.parse(getUser);

      if (query) {
        const data = query.docs
          .filter((doc) => doc.data().email !== currentUser.email)
          .map((doc) => {
            return {
              id: doc.id,
              ...doc.data(),
            };
          });
        setLoadingChats(false);

        setChats(data);
      }
    } catch (error) {
      setLoadingChats(false);
      console.log(error);
    }
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

  return (
    <>
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
        maxWidth="sm"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          marginTop: "4%",
          border: "2px solid lightgrey",
          borderRadius: 10,
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        <Typography variant="h4">Chats</Typography>
        <Box>
          {loadingChats ? (
            <CircularProgress />
          ) : chats?.length === 0 ? (
            <h4>No users found yet! Register with another account</h4>
          ) : (
            chats?.map((chat, index) => {
              return (
                <List
                  key={index}
                  sx={{
                    width: "100%",
                    bgcolor: "background.paper",
                  }}
                >
                  <ListItem
                    onClick={() =>
                      navigate(`/chat/${chat.name}`, {state: {chat, index}})
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <SupervisedUserCircle />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={chat.name} secondary={chat.email} />
                  </ListItem>
                </List>
              );
            })
          )}
        </Box>
      </Container>
    </>
  );
};

export default Chats;
