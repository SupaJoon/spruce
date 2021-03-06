import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
  Typography
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { AxiosResponse } from "axios";
import * as React from "react";
import * as rest from "../../rest/interface";
import "../../styles.css";

export const UserContext = React.createContext({
  username: ""
});
export const UserContextProvider = UserContext.Provider;
export const UserContextConsumer = UserContext.Consumer;

interface State {
  open: boolean;
  submitted: boolean;
  username: string;
  password: string;
  errorText: string;
  snackbarOpen: boolean;
  snackbarMessage: string;
}

class Props {
  public client: rest.Evergreen;
  public updateUsername: (username: string) => void;
}

export class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      open: false,
      submitted: false,
      username: "",
      password: "",
      errorText: "",
      snackbarOpen: false,
      snackbarMessage: ""
    };
  }

  public render() {
    return (
      <div>
        <Button
          onClick={this.handleClickOpen}
          color="inherit"
          className="login-button"
          id="login-button"
        >
          {this.context.username === "" ? "Log In" : "Log Out"}
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClickClose}
          onKeyPress={this.handleKeyPress}
          id="login-modal"
        >
          <DialogTitle id="form-dialog-title">Log In</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter your username and password.
            </DialogContentText>
            <TextField
              autoFocus={false}
              margin="dense"
              id="username"
              label="username"
              type="string"
              fullWidth={true}
              required={true}
              onChange={this.updateSingleField(this.state, "username")}
              value={this.state.username}
            />
            <TextField
              autoFocus={false}
              margin="dense"
              id="password"
              label="password"
              type="password"
              fullWidth={true}
              required={true}
              onChange={this.updateSingleField(this.state, "password")}
              value={this.state.password}
            />
            <Typography color="error">{this.state.errorText}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleClickClose}
              color="primary"
              id="cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={this.handleClickSubmit}
              color="primary"
              id="submit-button"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={this.state.snackbarOpen}
          message={this.state.snackbarMessage}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={this.onCloseSnackbar}
          action={[
            <IconButton
              key="close"
              color="inherit"
              onClick={this.onCloseSnackbar}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      </div>
    );
  }

  private handleClickOpen = () => {
    if (this.context.username === "") {
      this.setState({
        open: true
      });
    } else {
      this.setState({
        username: "",
        password: "",
        snackbarOpen: true,
        snackbarMessage: "Log Out Successful"
      });
      this.props.updateUsername("");
      this.context.username = "";
    }
  };

  private handleClickClose = () => {
    this.setState({
      open: false,
      username: "",
      password: "",
      errorText: ""
    });
  };

  private handleClickSubmit = () => {
    this.props.client
      .getToken(this.state.username, this.state.password)
      .then((resp: AxiosResponse<any>) => {
        if (resp.status >= 300) {
          if (resp.status === 401) {
            this.setState({
              errorText: "Invalid username or password"
            });
          }
        } else {
          this.props.updateUsername(this.state.username);
          this.context.username = this.state.username;
          this.setState({
            open: false,
            submitted: true,
            snackbarOpen: true,
            snackbarMessage: "Log In Successful"
          });
        }
      });
  };

  private handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      this.handleClickSubmit();
    }
  };

  private onCloseSnackbar = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    this.setState({
      snackbarOpen: false
    });
  };

  private updateSingleField = <T, K extends keyof T>(state: T, key: K) => {
    return (value: React.ChangeEvent<HTMLInputElement>) => {
      const newState = Object.assign({}, state);
      newState[key] = value.target.value as any;
      this.setState(newState);
    };
  };
}

Login.contextType = UserContext;

export default Login;
