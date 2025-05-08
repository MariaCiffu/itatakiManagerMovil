export default function PlantillaCard({jugador}) {

    return(
        <View>
            <Image></Image>
            <Text>{jugador.nombre} {jugador.apellido}</Text>
            <Text>{jugador.posicion}</Text>
            <Text>{jugador.dorsal}</Text>
        </View>
    )
}