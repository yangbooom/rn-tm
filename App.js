import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Button, Input} from 'react-native-elements';
import * as tf from '@tensorflow/tfjs';
import {fetch,} from '@tensorflow/tfjs-react-native';
// import * as tmImage from '@teachablemachine/image';
import * as jpeg from 'jpeg-js'
import {Camera} from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

export default function App() {
  const [imageLink, setImageLink] = useState("https://firebasestorage.googleapis.com/v0/b/paprika-cada.appspot.com/o/responses%2FeWO44U1GcR9CkIlPKRHV%2F028eUkJBLhT2SSIQ9XimKGVJktB2_0_1.jpg?alt=media&token=1e00992f-15a8-4c82-b793-d3c251748389")
  const [isEnabled, setIsEnabled] = useState(true)
  const [faces, setFaces] = useState([])
  const [myModel, setMyModel] = useState(null);
  const [image, setImage] = useState(null);
  const [maxPredictions, setMaxPredictions] = useState(null);
  const [labelContainer, setLabelContainer] = useState([])
  const [buffer, setBuffer] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState({});
  const [size, setSize] = useState({});


  // const [faceDetector, setFaceDetector] = useState("")
  // const [maskDetector, setMaskDetector] = useState("")
  // YB: load Assets
  // const [assets, error] = useAssets([require('./assets/myModel/model.json'), require('./assets/myModel/weights.bin'), require('./assets/myModel/metadata.json')]);
  // console.log(assets)
  useEffect(() => {
    (async () => {
      const {status} = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  useEffect(() => {
    async function loadModel() {
      // console.log(await Asset.loadAsync())
      console.log("[+] Application started")
      //Wait for tensorflow module to be ready
      const tfReady = await tf.ready();
      console.log("[+] Loading pre-trained model")

      const modelJson = "https://teachablemachine.withgoogle.com/models/zgaSAS6YF/model.json";
      const modelMetaData = "https://teachablemachine.withgoogle.com/models/zgaSAS6YF/metadata.json";
      // let _myModel = await tmImage.load(modelJson,modelMetaData);
      // let _myModel = await mobilenet.load({version: 1, modelUrl: "https://teachablemachine.withgoogle.com/models/27V-N0XYi/model.json"})
      // let _myModel = await tf.loadGraphModel("https://teachablemachine.withgoogle.com/models/27V-N0XYi/model.json")// const metadataJson = require('./assets/myModel/metadata.json');
      let _myModel = await tf.loadLayersModel("https://teachablemachine.withgoogle.com/models/lCuZG7NdY/model.json")// const metadataJson = require('./assets/myModel/metadata.json');

      // let _myModel = await mobilenet.load({version: 1, modelUrl: "https://teachablemachine.withgoogle.com/models/27V-N0XYi/model.json" })
      //let _myModel = await mobilenet.load()
      //
      // _myModel.summary();
      // const model = new CustomMobileNet(_myModel, metadataJson)
      setMyModel(_myModel);
      //Replce model.json and group1-shard.bin with your own custom model
      // const modelJson = await require("./assets/model/model.json");
      // const modelWeight = await require("./assets/model/group1-shard.bin");
      // const maskDetector = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeight));

      //Blazeface is a face detection model provided by Google
      // // const faceDetector = await blazeface.load();

      //Assign model to variable
      // setMaskDetector(maskDetector)
      // setFaceDetector(faceDetector)
      // console.log("[+] Model Loaded")


      setIsEnabled(true)
    }

    loadModel()
  }, []);

  const base64ImageToTensor = (base64) => {
    //Function to convert jpeg image to tensors
    const rawImageData = tf.util.encodeString(base64, 'base64');
    const TO_UINT8ARRAY = true;
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY);
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3);
    let offset = 0; // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset];
      buffer[i + 1] = data[offset + 1];
      buffer[i + 2] = data[offset + 2];
      offset += 4;
    }
    return tf.tensor3d(buffer, [height, width, 3]);
  }

  async function cropImage(imageUrl, width, height) {
    const actions = [{
      crop: {
        width,
        height,
        originX: 0,
        originY : 0
      },
    }];
    const saveOptions = {
      compress: 0.75,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    };
    return await ImageManipulator.manipulateAsync(imageUrl, actions, saveOptions);
  }

  async function resizeImage(imageUrl, width, height){
    const actions = [{
      crop: {
        width: Math.min(width, height),
        height: Math.min(width, height),
        originX: 0,
        originY: 0
      },
    }];
    const saveOptions = {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    };
    return await ImageManipulator.manipulateAsync(imageUrl, actions, saveOptions);
  }

  async function predict() {
    console.log("[+] Retrieving image from link :" + imageLink)
    // const _image = Asset.fromModule(require('./assets/dd.jpg'));
    // const _image = await fetch(imageLink, {}, {isBinary: true});
    // let _image = await cropImage(imageLink, Math.min(size.height, size.width) , Math.min(size.height, size.width));

    let _image = await resizeImage(imageLink, size.width , size.height);
    // setImageLink(_image.uri)


    console.log(_image.height)
    // const imageBuffer = await _image.arrayBuffer()
    // console.log(imageBuffer)
    // setBuffer(imageBuffer)
    // setImage(_image);

    // predict can take in an image, video or canvas html element
    // console.log(require('./assets/myModel/model.json'))

    // model = await tmImage.load(modelJson,modelMetaData);
    // let myModel = await tmImage.loadFromFiles(require('./assets/myModel/model.json')[0], require('./assets/myModel/weights.bin')[0], require('./assets/myModel/metadata.json')[0]);

    // let myModel = await tf.loadLayersModel("https://teachablemachine.withgoogle.com/models/zgaSAS6YF/model.json")
    // console.log("[+] Loading pre-trained model")
    // myModel.summary();

    // let imageTensor = await imageToTensor(imageBuffer)
    let imageTensor = base64ImageToTensor(_image.base64);
    // imageTensor = tf.image.resizeNearestNeighbor(imageTensor, [244,244])
    imageTensor =  imageTensor.resizeNearestNeighbor([224,224])
    const offset = tf.scalar(127.5);
    const normalized = imageTensor.sub(offset).div(offset);
    imageTensor = normalized.reshape([1, 224, 224, 3]);
    // console.log(imageTensor)
    //const prediction = await myModel.classify(imageTensor)

     const prediction = await myModel.predict(imageTensor);
    // const prediction = await myModel.classify(imageTensor)

    // console.log(prediction)
     const res = await prediction.data()

    console.log(JSON.stringify(res))
     const {"0": moire, "1": normal} = res
    setLabelContainer([moire, normal])

    //setLabelContainer(res)
    // for (let i = 0; i < maxPredictions; i++) {
    //   console.log(prediction[i].className)
    //   const _labelContainer = labelContainer;
    //   _labelContainer[i] = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    //   setLabelContainer(_labelContainer);
    // }
  }

  function imageToTensor(rawImageData) {
    //Function to convert jpeg image to tensors
    // const TO_UINT8ARRAY = true;
    const {width, height, data} = jpeg.decode(rawImageData, {useTArray: true});
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3);
    let offset = 0; // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset];
      buffer[i + 1] = data[offset + 1];
      buffer[i + 2] = data[offset + 2];
      offset += 4;
    }
    return tf.tensor3d(buffer, [height, width, 3]).resizeBilinear([224,224], false);
  }

  const getFaces = async () => {
    try {
      console.log("[+] Retrieving image from link :" + imageLink)
      const _image = await fetch(imageLink, {}, {isBinary: true});
      // setImage(_image);
      // const rawImageData = await response.arrayBuffer();
      // const imageTensor = imageToTensor(rawImageData).resizeBilinear([224, 224])
      // const faces = await faceDetector.estimateFaces(imageTensor, false);
      var tempArray = []
      //Loop through the available faces, check if the person is wearing a mask.
      for (let i = 0; i < faces.length; i++) {
        let color = "red"
        let width = parseInt((faces[i].bottomRight[1] - faces[i].topLeft[1]))
        let height = parseInt((faces[i].bottomRight[0] - faces[i].topLeft[0]))
        let faceTensor = imageTensor.slice([parseInt(faces[i].topLeft[1]), parseInt(faces[i].topLeft[0]), 0], [width, height, 3])
        faceTensor = faceTensor.resizeBilinear([224, 224]).reshape([1, 224, 224, 3])
        let result = await maskDetector.predict(faceTensor).data()
        //if result[0]>result[1], the person is wearing a mask
        if (result[0] > result[1]) {
          color = "green"
        }
        tempArray.push({
          id: i,
          location: faces[i],
          color: color
        })
      }
      setFaces(tempArray)
      console.log("[+] Prediction Completed")
    } catch {
      console.log("[-] Unable to load image")
    }

  }
  return (
    <View style={styles.container}>

      <Camera style={styles.camera} pictureSize={"11:9"} ref={ref => setCamera(ref)}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              camera.takePictureAsync({quality: 0, skipProcessing: true}).then(res => {
                setImageLink(res.uri)
                setImage(res)
                console.log(res.height, res.width)
                setSize({height: res.height, width: res.width})
              })
            }}>
          </TouchableOpacity>
        </View>
      </Camera>
      <Input
        placeholder="image link"
        onChangeText={(inputText) => {
          console.log(inputText)
          setImageLink(inputText)
          const elements = inputText.split(".")
          // if (elements.slice(-1)[0] == "jpg" || elements.slice(-1)[0] == "jpeg") {
          //   setIsEnabled(true)
          // } else {
          //   setIsEnabled(false)
          // }
        }}
        value={imageLink}
        containerStyle={{height: 40, fontSize: 10, margin: 15}}
        inputContainerStyle={{borderRadius: 10, borderWidth: 1, paddingHorizontal: 5}}
        inputStyle={{fontSize: 15}}

      />

      <Image
        style={{width: 224, height: 224, borderWidth: 2, borderColor: "black", resizeMode:"cover"}}
        source={{
          uri: imageLink
        }}
        PlaceholderContent={<View>No Image Found</View>}
      />
      <Button
        title="Predict"
        onPress={async () => {
          await predict()
        }}
        disabled={!isEnabled}
      />
      <View>
        {labelContainer.map((el, i) => {
          //alert(el.className, el.probability)
          return <Text key={i}>{el}</Text>
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  camera: {
    height: 320,
    width: 180,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    // flex: 0.1,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2e92ff',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },

});
