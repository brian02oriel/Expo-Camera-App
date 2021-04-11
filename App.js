import React, { Fragment } from "react";
import {ActivityIndicator,  StyleSheet, Text, View, Switch, TouchableOpacity, Image } from "react-native";
import * as Permissions from 'expo-permissions'
import * as FileSystem from 'expo-file-system'
import { Camera } from 'expo-camera'

const axios = require('axios');

initialState = {
  switchValue: true,
  hasCameraPermission: null,
  type: Camera.Constants.Type.back,
  imageuri: "",
  url: "",
  loading: false,
  res: {}
}
export default class App extends React.Component {
  state = {
   ...initialState
  };

  groups = {
    "4": "Etapa 1",
    "0": "Etapa 2",
    "2": "Etapa 3",
    "3": "Etapa 5",
    "1": "Etapa 4",
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    console.log(status)
    this.setState({ hasCameraPermission: status === "granted" });
  }

  cameraChange = () => {
    this.setState({
      imageuri: "",
      url: "",
      type:
        this.state.type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back
    });
  };

  snap = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();
      if (photo) {
        //console.log("photo: ", photo)
        this.setState({ imageuri: photo.uri });
      }
    }
  };

  clearData = async () => {                                         
    this.setState({ imageuri: "", res: {} });
  }


  upload = async () => {
    this.setState({loading: true})
    let imageBase64 = await FileSystem.readAsStringAsync(this.state.imageuri, {encoding: FileSystem.EncodingType.Base64})
    axios.post('http://192.168.0.3:5000/api/classifier', 
      { base64                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        : imageBase64 })
      .then((response)=> {
        console.log(response.data);
        this.setState({res: response.data})
        this.setState({loading: false})
      })
      .catch((error)=>{
        console.log("error: ", error);
        this.setState({loading: false})
    })
  };

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return (
        <View>
          <Text>No access to camera</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          {this.state.switchValue ? (
            <View style={styles.cameraView}>
              {this.state.imageuri != "" ? (
                <Image
                  source={{
                    uri: this.state.imageuri
                  }}
                  style={styles.uploadedImage}
                  resizeMode="contain"
                />
              ) : (
                <Camera
                  style={styles.camera}
                  type={this.state.type}
                  ref={ref => {
                    this.camera = ref;
                  }}
                >
                  <View style={styles.onScreenCameraButtonView}>
                    <TouchableOpacity
                      style={styles.onScreenCameraButtons}
                      onPress={this.cameraChange}
                    >
                      <Text
                        style={styles.onScreenButtonText}
                      >
                        Flip
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Camera>
              )}
            </View>
          ) : (
            <View style={styles.cameraView}>
              {this.state.url != "" ? (
                <Text>Uploaded url : {this.state.url}</Text>
              ) : null}
              <Text>Camera off</Text>
            </View>
          )}
            <Fragment>
              {
              Object.keys(this.state.res).length > 0 ? (
                <View style={styles.resultsView}>
                  <Text style={styles.resultText}> { this.groups[this.state.res["group"]] }</Text>
                  <Text style={styles.resultText}> - </Text>
                  <Text style={styles.resultText}> Días restantes: { this.state.res["days_lower"] } - { this.state.res["days_higher"] }  </Text>
                </View>

              ) : (
                <Fragment>
                  {
                    this.state.loading &&
                    <View style={styles.resultsLoaderView}>
                        <ActivityIndicator size="large" color="#FFF" />
                    </View> 
                  }
                      
                </Fragment>
              )
              }
              <View style={styles.buttonsView}>
              {this.state.imageuri == "" ? (
                <View style={styles.captureButtonView}>
                  <TouchableOpacity
                    style={styles.cameraButtons}
                    onPress={this.snap}
                  >
                    <Text
                      style={styles.buttonText}
                    >
                      Capture
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : 
              <View style={styles.postCaptureView}>
                <View style={styles.postCaptureButtonView}>
                  <TouchableOpacity
                    style={styles.postCameraButtons}
                    onPress={this.clearData}
                  >
                    <Text
                      style={styles.buttonText}
                    >
                      Take Another
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.postCaptureButtonView}>
                  <TouchableOpacity
                    style={styles.postCameraButtons}
                    onPress={this.upload}
                  >
                    <Text
                      style={styles.buttonText}
                    >
                      Upload
                    </Text>
                  </TouchableOpacity>
                </View> 
              </View>
              }

            </View>
            </Fragment>
        </View>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25283d",
    alignItems: "center",
    justifyContent: "flex-start"
  },
  switchview: {
    marginTop: 50,
    backgroundColor: "#FFF",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 5
  },
  switch: {
    padding: 5
  },
  cameraView: {
    marginTop: 50,
    height: 550,
    width: 350,
    backgroundColor: "#000",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  camera: {
    height: 550,
    width: 350,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  resultsView:{
    width: 350,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    color: "#FFF",
    borderColor: "#FFF",
    borderWidth: 2,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5
  },
  resultText: {
    fontSize: 20,
    padding: 5,
    color: "#FFF"
  },
  resultsLoaderView:{
    width: 350,
    alignItems: 'center',
    justifyContent: 'center'

  },
  cameraButtonView: {
    height: "100%",
    backgroundColor: "transparent"
  },
  cameraButtons: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#FFF",
    borderColor: "#FFF",
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    width: 100,
  },
  
  buttonText: {
    fontSize: 18,
    color: "#25283d",
  },
  onScreenCameraButtonView:{
    height: "100%",
    backgroundColor: "transparent"
  },
  onScreenCameraButtons: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: "#FFF",
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    width: 55,
    height: 75,
  },
  onScreenButtonText:{
    fontSize: 18,
    color: "#FFF",
  },
  captureButtonView: {
    height: 200,
    alignItems: 'center',
  },
  postCaptureView:{
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  postCaptureButtonView: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postCameraButtons:{
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#FFF",
    borderColor: "#FFF",
    borderWidth: 2,
    borderRadius: 5,
    height: 50,
    width: "90%",
  },
  buttonsView: {
    marginTop: 10,
    height: 100,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  uploadedImage: {
    height: 500,
    width: 350,
    padding: 10
  }
});