import { Colors } from "@/assets/styles";
import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
  board: { position: 'absolute', right: 0, top: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52, 52, 52, 0.5)', zIndex: 1000 },
  scored: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
    position: 'absolute',
    opacity: 0.5,
    zIndex: 100,
  },
  btnRemove: {
    transform: [{ rotateZ: '45deg' }],
    backgroundColor: Colors.primaryBlue,
    width: 50,
    height: 30,
    position: 'absolute',
    bottom: 30,
  },
  icon: {
    width: 40, height: 40,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', flex: 1 },
  fullscreenVideo: {
    backgroundColor: 'black',
    elevation: 1,
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  imageContainer: {
    borderColor: 'blue',
    borderRadius: 5,
    flex: 1,
  },
  text: {
    color: 'blue'
  },
  button: {
    width: 200,
    backgroundColor: 'blue',
    borderRadius: 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 15
  },
  box: {
    position: 'absolute',
    borderColor: 'blue',
    borderWidth: 2,
    padding: 10,
  },
  boxes: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  }
});

export default styles