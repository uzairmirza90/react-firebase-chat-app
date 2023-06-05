import React, {useEffect, useState} from "react";
import {Container, Box, Typography, TextField, Button} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FormControl from "@mui/material/FormControl";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {auth, db} from "../../firebase/config";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useNavigate} from "react-router-dom";
import {addDoc, collection} from "firebase/firestore";

const Register = ({loading, setLoading}) => {
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [registerFormErrors, setRegisterFormErrors] = useState({
    usernameError: "",
    emailError: "",
    passwordError: "",
  });
  const navigate = useNavigate();
  const [firebaseError, setFirebaseError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    const user = localStorage.getItem("chat-app-user");
    if (user) {
      navigate("/chats");
      console.log("ha");
    }
  }, []);

  const handleRegister = async (e) => {
    let usernameError = "";
    let emailError = "";
    let passwordError = "";

    if (registerForm.username === "") {
      usernameError = "Please Enter Username";
    }

    if (registerForm.email === "") {
      emailError = "Please enter an email.";
    }

    if (registerForm.password === "") {
      passwordError = "Please enter a password.";
    }

    setRegisterFormErrors({usernameError, emailError, passwordError});

    if (
      registerForm.username !== "" &&
      registerForm.email !== "" &&
      registerForm.password !== ""
    ) {
      setLoading(true);
      setFirebaseError("");
      try {
        await createUserWithEmailAndPassword(
          auth,
          registerForm.email,
          registerForm.password
        )
          .then(async (data) => {
            console.log(data.user);
            const usersRef = collection(db, "users");
            await addDoc(usersRef, {
              email: registerForm.email,
              password: registerForm.password,
              name: registerForm.username,
            });
            setLoading(false);
            toast("Success!");
            localStorage.setItem(
              "chat-app-user",
              JSON.stringify({
                email: data.user.email,
                uid: data.user.uid,
              })
            );
            navigate("/chats");
          })
          .catch((error) => {
            console.log("Error: ", error);
            setLoading(false);
            setFirebaseError(error.code);
          });
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
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
        width={"100%"}
        backgroundColor={"gray"}
      >
        <Typography variant="h4" color={"white"} fontWeight={600}>
          Chat App
        </Typography>
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
          width: 450,
        }}
      >
        <ToastContainer />
        <Typography variant="h4">Register</Typography>
        {firebaseError && <Alert severity="error">{firebaseError}</Alert>}
        <TextField
          label="Username"
          fullWidth
          value={registerForm.username}
          onChange={(e) => {
            e.preventDefault();
            setRegisterForm({...registerForm, username: e.target.value});
            if (e.target.value.length > 0) {
              setRegisterFormErrors({...registerFormErrors, usernameError: ""});
            }
          }}
        />
        {registerFormErrors.usernameError && (
          <Typography
            color={"red"}
            variant="p"
            style={{alignSelf: "flex-start"}}
          >
            {registerFormErrors.usernameError}
          </Typography>
        )}
        <TextField
          error={false}
          label="Email"
          fullWidth
          value={registerForm.email}
          onChange={(e) => {
            e.preventDefault();
            setRegisterForm({...registerForm, email: e.target.value});
            if (e.target.value.length > 0) {
              setRegisterFormErrors({...registerFormErrors, emailError: ""});
            }
          }}
        />
        {registerFormErrors.emailError && (
          <Typography
            color={"red"}
            variant="p"
            style={{alignSelf: "flex-start"}}
          >
            {registerFormErrors.emailError}
          </Typography>
        )}
        <FormControl fullWidth>
          <InputLabel htmlFor="outlined-adornment-password">
            Password
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? "text" : "password"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            fullWidth
            value={registerForm.password}
            onChange={(e) => {
              e.preventDefault();
              setRegisterForm({...registerForm, password: e.target.value});
              if (e.target.value.length > 0) {
                setRegisterFormErrors({
                  ...registerFormErrors,
                  passwordError: "",
                });
              }
            }}
          />
        </FormControl>
        {registerFormErrors.passwordError && (
          <Typography
            color={"red"}
            variant="p"
            style={{alignSelf: "flex-start"}}
          >
            {registerFormErrors.passwordError}
          </Typography>
        )}
        <Box display={"flex"} gap={2}>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/login");
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={(e) => {
                  handleRegister();
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

export default Register;
