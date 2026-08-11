import { ImageBackground, StyleSheet, View } from "react-native";


export default function HomeScreen() {
    return ( 
        <View style={styles.container}>
            <ImageBackground
                source={require("../../../assets/images/KickOff home.png")}
                style={styles.background}
                resizeMode="cover"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000"
    },

    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },

});