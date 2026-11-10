// ==========================================
// DATOS DE ESTADOS · MIRAVIA
// Hospedaje, comida y lugares turísticos
// ==========================================

const DATOS_ESTADOS = {

  /* ---------- BASE DE TODOS LOS ESTADOS ---------- */

  aguascalientes: {
    nombre: "Aguascalientes",
    capital: "Aguascalientes",
    coords: [21.89, -102.29],
    descripcion: "Disfruta el centro histórico, el Jardín de San Marcos y el Pueblo Mágico de Calvillo.",
    lugares: [
      {
        nombre: "Centro histórico y Catedral de Aguascalientes",
        descripcion: "Recorre la Plaza de la Patria y conoce la catedral y los edificios históricos del centro.",
        imagen: "../../img/lugares/aguascalientes-centro-historico.png",
        credito: "Catedral y plaza principal de Aguascalientes — Luisalvaz · CC0",
        fuente: "https://commons.wikimedia.org/wiki/File:Catedral_de_Aguascalientes_y_plaza_principal_desde_un_dron_01.png"
      },
      {
        nombre: "Jardín de San Marcos",
        descripcion: "Visita este jardín tradicional, famoso por sus jardines, sus fuentes y la Feria Nacional de San Marcos.",
        imagen: "../../img/lugares/aguascalientes-jardin-san-marcos.jpg",
        credito: "Jardín de San Marcos — Luis Alvaz · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:El_Jardín_de_San_Marcos_en_Aguascalientes_01.jpg"
      },
      {
        nombre: "Calvillo, Pueblo Mágico",
        descripcion: "Descubre la parroquia del Señor del Salitre y las calles de este pueblo famoso por sus guayabas.",
        imagen: "../../img/lugares/aguascalientes-calvillo.jpg",
        credito: "Parroquia del Señor del Salitre en Calvillo — Luisalvaz · CC BY 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Vista_a%C3%A9rea_de_la_Parroquia_del_Se%C3%B1or_del_Salitre_en_Calvillo,_Aguascalientes_01.jpg"
      }
    ]
  },
  "baja-california": {
    nombre: "Baja California",
    capital: "Mexicali",
    coords: [30.84, -115.28],
    imagenPortada: "../../img/lugares/baja-california-valle-guadalupe.jpg",
    descripcion: "Recorre los viñedos del Valle de Guadalupe, conoce La Bufadora en Ensenada y disfruta las playas de Rosarito.",
    lugares: [
      {
        nombre: "Valle de Guadalupe",
        descripcion: "Visita los viñedos y disfruta los paisajes de la reconocida región vinícola de Baja California.",
        imagen: "../../img/lugares/baja-california-valle-guadalupe.jpg",
        credito: "Viñedo en el Valle de Guadalupe — Tomascastelazo · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Guadalupe_valley.jpg"
      },
      {
        nombre: "La Bufadora, Ensenada",
        descripcion: "Observa este géiser marino natural, donde las olas chocan contra la costa rocosa.",
        imagen: "../../img/lugares/baja-california-bufadora.jpg",
        credito: "La Bufadora — Alex Tapia · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:La_Bufadora,_Ensenada,_Mexico.jpg"
      },
      {
        nombre: "Playas de Rosarito",
        descripcion: "Relájate frente al Pacífico y disfruta la costa de Rosarito, al sur de Tijuana.",
        imagen: "../../img/lugares/baja-california-rosarito.jpg",
        credito: "Playa de Rosarito — Kennybozzle · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Rosarito_Beach,_Baja_California,_Mexico.jpg"
      }
    ]
  },
  "baja-california-sur": {
    nombre: "Baja California Sur",
    capital: "La Paz",
    coords: [25.04, -111.66],
    imagenPortada: "../../img/lugares/baja-california-sur-el-arco.jpg",
    descripcion: "Explora Los Cabos, Playa Balandra en La Paz y la histórica Misión de Loreto junto al mar de Cortés.",
    lugares: [
      {
        nombre: "El Arco de Cabo San Lucas",
        descripcion: "Admira esta formación rocosa junto al mar de Cortés, en el extremo sur de la península.",
        imagen: "../../img/lugares/baja-california-sur-el-arco.jpg",
        credito: "El Arco de Cabo San Lucas — Comisión Mexicana de Filmaciones · CC BY-SA 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:El_Arco,_Cabo_San_Lucas,_Baja_California_Sur_(16638939645).jpg"
      },
      {
        nombre: "Playa Balandra",
        descripcion: "Disfruta sus aguas tranquilas y poco profundas y contempla el famoso Hongo de Balandra.",
        imagen: "../../img/lugares/baja-california-sur-balandra.jpg",
        credito: "Playa Balandra — Pequeño mar · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Playa_Balandra,_Baja_California_Sur.jpg"
      },
      {
        nombre: "Misión de Nuestra Señora de Loreto",
        descripcion: "Visita la misión histórica de Loreto y conoce uno de los sitios emblemáticos de la península.",
        imagen: "../../img/lugares/baja-california-sur-loreto.jpg",
        credito: "Misión de Nuestra Señora de Loreto — Kirt Edblom · CC BY-SA 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Misi%C3%B3n_de_Nuestra_Se%C3%B1ora_de_Loreto_-_Baja_California_Sur_(14563317428).jpg"
      }
    ]
  },
  campeche: {
    nombre: "Campeche",
    capital: "San Francisco de Campeche",
    coords: [19.83, -90.53],
    descripcion: "Ciudad amurallada colonial, Patrimonio de la Humanidad, y ruinas mayas como Edzná.",
    lugares: [
      {
        nombre: "Ciudad amurallada de Campeche",
        descripcion: "Recorre sus murallas coloniales y las fachadas de colores del centro histórico.",
        imagen: "../../img/lugares/campeche-murallas.jpg",
        credito: "Old City Walls and Colonial Facades — Adam Jones · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Old_City_Walls_and_Colonial_Facades_-_Campeche_-_Mexico.jpg"
      },
      {
        nombre: "Centro histórico de Campeche",
        descripcion: "Plazas, arquitectura colonial y un centro histórico reconocido como Patrimonio de la Humanidad.",
        imagen: "../../img/lugares/campeche-centro-historico.jpg",
        credito: "Independence Square, Campeche — Sharon Hahn Darlin · CC BY 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Independence_Square_(Plaza_de_La_Independencia),_Campeche,_Mexico.jpg"
      },
      {
        nombre: "Zona arqueológica de Edzná",
        descripcion: "Explora la antigua ciudad maya y sus templos monumentales entre la selva campechana.",
        imagen: "../../img/lugares/campeche-edzna.jpg",
        credito: "The Acropolis at Edzná — Adam Jones · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:The_Acropolis_-_Edzna_Archaeological_Site_-_Campeche_State_-_Mexico_-_03.jpg"
      }
    ]
  },
  chiapas: {
    nombre: "Chiapas",
    capital: "Tuxtla Gutiérrez",
    coords: [16.75, -93.12],
    descripcion: "Cañón del Sumidero, San Cristóbal de las Casas, Cascadas de Agua Azul y las ruinas de Palenque.",
    lugares: [
      {
        nombre: "Cañón del Sumidero",
        descripcion: "Navega entre paredes de roca imponentes y disfruta los paisajes del río Grijalva.",
        imagen: "../../img/lugares/chiapas-canon-del-sumidero.jpg",
        credito: "Cañón del Sumidero — Christopher Javier Cuenca García · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Ca%C3%B1on_del_Sumidero,_Chiapas,_M%C3%A9xico.jpg"
      },
      {
        nombre: "San Cristóbal de las Casas",
        descripcion: "Calles empedradas, casas coloridas y la cúpula de la iglesia entre las montañas chiapanecas.",
        imagen: "../../img/lugares/chiapas-san-cristobal.jpg",
        credito: "Street Scene with Church Cupola — Adam Jones · CC BY 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Street_Scene_with_Church_Cupola_-_San_Cristobal_de_las_Casas_-_Chiapas_-_Mexico.jpg"
      },
      {
        nombre: "Cascadas de Agua Azul y las ruinas de Palenque",
        descripcion: "Descubre las cascadas turquesa de Agua Azul y la antigua ciudad maya de Palenque.",
        imagen: "../../img/lugares/chiapas-agua-azul-palenque.jpg",
        credito: "Cascadas de Agua Azul — Carlos Valenzuela · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Cascadas_de_Agua_Azul2020p3.jpg"
      }
    ]
  },
  oaxaca: {
    nombre: "Oaxaca",
    capital: "Oaxaca de Juárez",
    coords: [17.07, -96.72],
    descripcion: "Monte Albán, Hierve el Agua, mole, tlayudas y las playas de Huatulco y Puerto Escondido.",
    hoteles: [
      { nombre: "Casa de los Vientos", tipo: "HOTEL", precio: "$1,750", calificacion: "4.7", ubicacion: "Centro Histórico, Oaxaca de Juárez", region: "Valles Centrales", descripcion: "Hotel boutique con encanto colonial, terraza y desayuno tradicional oaxaqueño." },
      { nombre: "Hotel Oaxaca Real", tipo: "BOUTIQUE", precio: "$2,200", calificacion: "4.8", ubicacion: "Oaxaca de Juárez, Oaxaca", region: "Valles Centrales", descripcion: "Alojamiento elegante cerca del centro, ideal para explorar iglesias, mercados y cafés." }
    ],
    restaurantes: [
      { nombre: "Los Danzantes Oaxaca", tipo: "MEXICANA", precio: "$420", calificacion: "4.8", ubicacion: "Centro Histórico, Oaxaca de Juárez", region: "Valles Centrales", descripcion: "Gastronomía oaxaqueña con mole, mezcal y ambiente artístico en una casona histórica." },
      { nombre: "Mercado 20 de Noviembre", tipo: "MERCADO", precio: "$180", calificacion: "4.7", ubicacion: "Oaxaca de Juárez, Oaxaca", region: "Valles Centrales", descripcion: "Tlayudas, memelas, tasajo y antojitos típicos con sabor auténtico de la ciudad." }
    ],
    lugares: [
      {
        nombre: "Monte Albán",
        descripcion: "Sitio arqueológico zapoteca con vistas panorámicas y una de las ciudades prehispánicas más importantes del país.",
        imagen: "../../img/lugares/monte-alban.png"
      },
      {
        nombre: "Hierve el Agua",
        descripcion: "Cascadas petrificadas, pozas naturales y vistas de las montañas oaxaqueñas.",
        imagen: "../../img/lugares/hierve-el-agua.png"
      },
      {
        nombre: "Puerto Escondido",
        descripcion: "Playas de olas perfectas para surfear, restaurantes rústicos y un ambiente relajado del pacífico.",
        imagen: "../../img/lugares/puerto-escondido.png"
      }
    ]
  },
  chihuahua: {
    nombre: "Chihuahua",
    capital: "Chihuahua",
    coords: [28.63, -106.07],
    imagenPortada: "../../img/lugares/chihuahua-barrancas-cobre.jpg",
    descripcion: "Explora las Barrancas del Cobre, la cascada de Basaseachi y la antigua ciudad de Paquimé.",
    lugares: [
      {
        nombre: "Barrancas del Cobre",
        descripcion: "Contempla los paisajes de la Sierra Tarahumara y recorre los miradores del cañón.",
        imagen: "../../img/lugares/chihuahua-barrancas-cobre.jpg",
        credito: "Barrancas del Cobre — Comisión Mexicana de Filmaciones · CC BY-SA 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Barrancas_del_Cobre,_Chihuahua_(32525951550).jpg"
      },
      {
        nombre: "Cascada de Basaseachi",
        descripcion: "Visita una de las cascadas más altas de México, en el parque nacional del mismo nombre.",
        imagen: "../../img/lugares/chihuahua-basaseachi.jpg",
        credito: "Cascada de Basaseachi — Comisión Mexicana de Filmaciones · CC BY-SA 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Cascada_de_Basaseachi,_Sierra_Madre_Occidental,_Chihuahua.jpg"
      },
      {
        nombre: "Zona arqueológica de Paquimé",
        descripcion: "Recorre las antiguas construcciones de adobe de esta ciudad prehispánica en Casas Grandes.",
        imagen: "../../img/lugares/chihuahua-paquime.jpg",
        credito: "Zona arqueológica de Paquimé — Levi bernardo · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Zona_arqueol%C3%B3gica_de_Paquim%C3%A9_2020.jpg"
      }
    ]
  },
  "ciudad-de-mexico": { nombre: "Ciudad de México", capital: "Ciudad de México", coords: [19.43, -99.13], descripcion: "Museos, el Zócalo, Teotihuacán cerca y una de las mejores gastronomías del mundo." },
  coahuila: {
    nombre: "Coahuila",
    capital: "Saltillo",
    coords: [25.43, -100.99],
    imagenPortada: "../../img/lugares/coahuila-dunas-bilbao.jpg",
    descripcion: "Explora las pozas azules de Cuatro Ciénegas, las Dunas de Bilbao y el Pueblo Mágico de Parras.",
    lugares: [
      {
        nombre: "Cuatro Ciénegas y la Poza Azul",
        descripcion: "Descubre las pozas de agua cristalina y los paisajes únicos del valle de Cuatro Ciénegas.",
        imagen: "../../img/lugares/coahuila-cuatro-cienegas.jpg",
        credito: "Poza Azul, Cuatro Ciénegas — Comisión Mexicana de Filmaciones · CC BY-SA 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Poza_Azul,_Cuatro_Ci%C3%A9negas,_Coahuila_(22622991294).jpg"
      },
      {
        nombre: "Dunas de Bilbao",
        descripcion: "Camina por este paisaje de arena en Viesca y disfruta sus atardeceres en el desierto.",
        imagen: "../../img/lugares/coahuila-dunas-bilbao.jpg",
        credito: "Dunas de Bilbao — Comisión Mexicana de Filmaciones · CC BY-SA 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Dunas_de_Bilbao,_Viesca,_Coahuila_(22731683007).jpg"
      },
      {
        nombre: "Parras de la Fuente",
        descripcion: "Visita sus viñedos, calles tradicionales y la iglesia del Santo Madero.",
        imagen: "../../img/lugares/coahuila-parras.jpg",
        credito: "Iglesia del Santo Madero, Parras — Filiberto Lara Salcido · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Iglesia_del_Santo_Madero_-_Parras_de_la_Fuente,_Coahuila_Mexico.jpg"
      }
    ]
  },
  colima: {
    nombre: "Colima",
    capital: "Colima",
    coords: [19.24, -103.72],
    descripcion: "El Volcán de Fuego, las playas de Manzanillo y el Pueblo Mágico de Comala.",
    lugares: [
      {
        nombre: "Volcán de Fuego de Colima",
        descripcion: "Admira uno de los volcanes más activos de México desde los miradores de la región.",
        imagen: "../../img/lugares/colima-volcan.jpg",
        credito: "Volcán de Fuego de Colima — Michbalbi · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Volc%C3%A1n_de_Fuego_de_Colima.jpg"
      },
      {
        nombre: "Comala, Pueblo Mágico",
        descripcion: "Pasea por su plaza, sus calles blancas y sus portales con vistas al Volcán de Fuego.",
        imagen: "../../img/lugares/colima-comala.jpg",
        credito: "Plaza de Comala — Irene Soria Guzmán · CC BY 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Plaza_de_Comala.jpg"
      },
      {
        nombre: "Bahía de Santiago, Manzanillo",
        descripcion: "Disfruta las playas y las vistas del Pacífico en una de las bahías más conocidas de Colima.",
        imagen: "../../img/lugares/colima-manzanillo.jpg",
        credito: "Bahía de Santiago, Manzanillo — Ale Ramos M · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Bah%C3%ADa_De_Santiago_en_Manzanillo,_Colima,_M%C3%A9xico.jpg"
      }
    ]
  },
  durango: {
    nombre: "Durango",
    capital: "Victoria de Durango",
    coords: [24.02, -104.65],
    imagenPortada: "../../img/lugares/durango-centro.jpg",
    descripcion: "Descubre el centro histórico de Durango, las cascadas de Mexiquillo y el puente colgante de Ojuela.",
    lugares: [
      {
        nombre: "Catedral y centro histórico de Durango",
        descripcion: "Recorre la Plaza de Armas y admira la arquitectura de la Catedral Basílica.",
        imagen: "../../img/lugares/durango-catedral.jpg",
        credito: "Catedral Basílica de Durango — Alvaro Dioni · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Catedral_Basilica_de_Durango_01.jpg"
      },
      {
        nombre: "Parque Natural Mexiquillo",
        descripcion: "Disfruta sus cascadas, bosques y formaciones rocosas en la Sierra Madre Occidental.",
        imagen: "../../img/lugares/durango-mexiquillo.jpg",
        credito: "Cascada de Mexiquillo — Raer · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Cascada_de_Mexiquillo.jpg"
      },
      {
        nombre: "Puente colgante de Ojuela",
        descripcion: "Conoce este histórico puente minero suspendido sobre el paisaje semidesértico de Mapimí.",
        imagen: "../../img/lugares/durango-puente-ojuela.jpg",
        credito: "Puente de la Ojuela — Isaac Salvador Pérez · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Puente_de_la_Ojuela,_Durango.jpg"
      }
    ]
  },
  guerrero: {
    nombre: "Guerrero",
    capital: "Chilpancingo",
    coords: [17.55, -99.50],
    descripcion: "Acapulco y su bahía, Taxco la ciudad plateada y grutas impresionantes.",
    lugares: [
      {
        nombre: "Acapulco y su bahía",
        descripcion: "Disfruta las vistas de la bahía de Santa Lucía y las playas de Acapulco.",
        imagen: "../../img/lugares/guerrero-acapulco.jpg",
        credito: "Santa Lucía Bay in Acapulco — Nam · CC BY 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Santa_Lucia_Bay_in_Acapulco,_Mexico.jpg"
      },
      {
        nombre: "Taxco, ciudad plateada y grutas",
        descripcion: "Recorre las calles empedradas de Taxco y descubre las cercanas Grutas de Cacahuamilpa.",
        imagen: "../../img/lugares/guerrero-taxco.jpg",
        credito: "View of Taxco from the cable car — Melissa Guadalupe Huertas · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:View_of_Taxco_from_the_cable_car,_Mexico.jpg"
      }
    ]
  },
  hidalgo: {
    nombre: "Hidalgo",
    capital: "Pachuca",
    coords: [20.10, -98.76],
    descripcion: "Barranca de Metztitlán, prismas basálticos de Santa María Regla y las luces de Pachuca.",
    lugares: [
      {
        nombre: "Barranca de Metztitlán",
        descripcion: "Explora la Reserva de la Biosfera de la Barranca de Metztitlán y visita el exconvento de los Santos Reyes.",
        imagen: "../../img/lugares/hidalgo-metztitlan.jpg",
        credito: "HeyDiallexLoL (Maria de los Angeles) · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:1_Metztitl%C3%A1n_%22Templo_y_exconvento_de_los_santos_Reyes%22_en_el_estado_de_Hidalgo,_esta_dentro_de_la_Reserva_de_la_Biosfera_de_la_Barranca_de_Metztitl%C3%A1n.jpg"
      },
      {
        nombre: "Prismas basálticos de Santa María Regla",
        descripcion: "Conoce las formaciones de roca volcánica y las cascadas de Huasca de Ocampo.",
        imagen: "../../img/lugares/hidalgo-prismas-basalticos.jpg",
        credito: "Diego Delso · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Prismas_Bas%C3%A1lticos,_Huasca_de_Ocampo,_Hidalgo,_M%C3%A9xico,_2013-10-10,_DD_10.JPG"
      }
    ]
  },
  "estado-de-mexico": {
    nombre: "Estado de México",
    capital: "Toluca",
    coords: [19.29, -99.65],
    descripcion: "Pirámides de Teotihuacán, Nevado de Toluca y el Cosmovitral de Toluca.",
    lugares: [
      {
        nombre: "Pirámides de Teotihuacán",
        descripcion: "Recorre la antigua ciudad y admira la Pirámide del Sol y la Pirámide de la Luna.",
        imagen: "../../img/lugares/estado-mexico-teotihuacan.jpg",
        credito: "Diego Delso · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Teotihuac%C3%A1n,_M%C3%A9xico,_2013-10-13,_DD_93.JPG"
      },
      {
        nombre: "Nevado de Toluca",
        descripcion: "Contempla el cráter volcánico y la Laguna del Sol en el Xinantécatl.",
        imagen: "../../img/lugares/estado-mexico-nevado-toluca.jpg",
        credito: "Juan Carlos Fonseca Mata · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Nevado_de_Toluca,_Lago_de_Sol_4.jpg"
      },
      {
        nombre: "Cosmovitral de Toluca",
        descripcion: "Visita el Jardín Botánico y admira los coloridos vitrales monumentales de Toluca.",
        imagen: "../../img/lugares/estado-mexico-cosmovitral.jpg",
        credito: "Juan Carlos Fonseca Mata · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Cosmovitral_(Toluca,_M%C3%A9xico)_I.jpg"
      }
    ]
  },
  michoacan: {
    nombre: "Michoacán",
    capital: "Morelia",
    coords: [19.70, -101.19],
    descripcion: "Morelia colonial, la mariposa monarca, Pátzcuaro y su noche de muertos única.",
    lugares: [
      {
        nombre: "Morelia colonial",
        descripcion: "Admira la catedral y la arquitectura colonial del centro histórico de Morelia.",
        imagen: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Santa_Iglesia_Catedral%2CMorelia%2CEstado_de_Michoac%C3%A1n%2CM%C3%A9xico.jpg",
        credito: "Enrique López-Tamayo Biosca · CC BY 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Santa_Iglesia_Catedral,Morelia,Estado_de_Michoac%C3%A1n,M%C3%A9xico.jpg"
      },
      {
        nombre: "La mariposa monarca",
        descripcion: "Visita los santuarios de la mariposa monarca en los bosques de Michoacán.",
        imagen: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/ButterfliesChincua08.JPG/1280px-ButterfliesChincua08.JPG",
        credito: "AlejandroLinaresGarcia · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:ButterfliesChincua08.JPG"
      },
      {
        nombre: "Pátzcuaro y su noche de muertos única",
        descripcion: "Vive las tradiciones del Día de Muertos en la región del lago de Pátzcuaro y la isla de Janitzio.",
        imagen: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Noche_de_Muertos_en_Janitzio.jpg/1280px-Noche_de_Muertos_en_Janitzio.jpg",
        credito: "Miguel Angel Mandujano Contreras · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Noche_de_Muertos_en_Janitzio.jpg"
      }
    ]
  },
  "nuevo-leon": {
    nombre: "Nuevo León",
    capital: "Monterrey",
    coords: [25.67, -100.31],
    imagenPortada: "../../img/lugares/nuevo-leon-cerro-silla.jpg",
    descripcion: "Disfruta las vistas del Cerro de la Silla, las Grutas de García y la Cascada Cola de Caballo.",
    lugares: [
      {
        nombre: "Cerro de la Silla",
        descripcion: "Admira el ícono natural de Monterrey y disfruta sus paisajes de montaña.",
        imagen: "../../img/lugares/nuevo-leon-cerro-silla.jpg",
        credito: "Cerro de la Silla — Ginamer · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Cerro_de_la_Silla,_Monterrey,_N.L.jpg"
      },
      {
        nombre: "Cascada Cola de Caballo",
        descripcion: "Visita esta cascada rodeada de vegetación en el municipio de Santiago.",
        imagen: "../../img/lugares/nuevo-leon-cola-caballo.jpg",
        credito: "Cascada Cola de Caballo — Fernando2812l · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Cascada_Cola_de_Caballo,_Nuevo_Leon.JPG"
      },
      {
        nombre: "Grutas de García",
        descripcion: "Recorre sus cavernas y contempla las formaciones de piedra caliza.",
        imagen: "../../img/lugares/nuevo-leon-grutas-garcia.jpg",
        credito: "Grutas de García — Phyrexian · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Grutas_de_Garc%C3%ADa_0447.jpg"
      }
    ]
  },
  morelos: {
    nombre: "Morelos",
    capital: "Cuernavaca",
    coords: [18.68, -99.10],
    descripcion: "La ciudad de la eterna primavera, Tepoztlán místico y las lagunas de Zempoala.",
    lugares: [
      {
        nombre: "Cuernavaca, ciudad de la eterna primavera",
        descripcion: "Visita Cuernavaca y conoce el Palacio de Cortés, uno de los edificios históricos más emblemáticos de Morelos.",
        imagen: "../../img/lugares/morelos-cuernavaca.jpg",
        credito: "Palacio de Cortés Cuernavaca — LuisS211 · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Palacio_de_Cort%C3%A9s_Cuernavaca,_Morelos.jpg"
      },
      {
        nombre: "Tepoztlán místico y las lagunas de Zempoala",
        descripcion: "Recorre las calles de Tepoztlán y disfruta los paisajes naturales de Morelos.",
        imagen: "../../img/lugares/morelos-tepoztlan.jpg",
        credito: "Camino a la Pirámide del Tepozteco — R.gonzalez94 · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Camino_a_la_Piramide_del_Tepozteco.jpg"
      }
    ]
  },
  nayarit: {
    nombre: "Nayarit",
    capital: "Tepic",
    coords: [21.75, -104.85],
    imagenPortada: "../../img/lugares/nayarit-sayulita.jpg",
    descripcion: "Descubre las playas de Sayulita, la isla de Mexcaltitán y la bahía de Matanchén, cerca de San Blas.",
    lugares: [
      {
        nombre: "Sayulita, Riviera Nayarit",
        descripcion: "Disfruta la playa, el ambiente del pueblo y las olas de este destino de la Riviera Nayarit.",
        imagen: "../../img/lugares/nayarit-sayulita.jpg",
        credito: "Playa de Sayulita — Grapesy · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Sayulita_Playa.jpg"
      },
      {
        nombre: "Isla de Mexcaltitán",
        descripcion: "Recorre en lancha esta isla rodeada de canales y manglares en el norte de Nayarit.",
        imagen: "../../img/lugares/nayarit-mexcaltitan.jpg",
        credito: "Isla de Mexcaltitán — Comisión Mexicana de Filmaciones · CC BY-SA 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Isla_Mexcaltit%C3%A1n,_Nayarit-_Mexcaltitl%C3%A1n_Island,_Nayarit_(11933745263).jpg"
      },
      {
        nombre: "Bahía de Matanchén y San Blas",
        descripcion: "Relájate en la costa de Matanchén y conoce el puerto histórico de San Blas.",
        imagen: "../../img/lugares/nayarit-matanchen.jpg",
        credito: "Bahía de Matanchén — House · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Bah%C3%ADa_de_Matanchen.JPG"
      }
    ]
  },
  "san-luis-potosi": {
    nombre: "San Luis Potosí",
    capital: "San Luis Potosí",
    coords: [22.16, -100.99],
    descripcion: "Las cascadas de la Huasteca Potosina, el jardín surrealista de Xilitla y el pueblo histórico de Real de Catorce.",
    lugares: [
      {
        nombre: "Cascada de Tamul",
        descripcion: "Contempla la imponente caída de agua en el corazón de la Huasteca Potosina.",
        imagen: "../../img/lugares/san-luis-potosi-tamul.jpg",
        credito: "Cascada de Tamul — Sarkel · CC BY 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Cascada_de_Tamul.jpg"
      },
      {
        nombre: "Jardín surrealista de Las Pozas, Xilitla",
        descripcion: "Recorre el jardín escultórico de Edward James, rodeado por la vegetación de la Huasteca.",
        imagen: "../../img/lugares/san-luis-potosi-las-pozas.jpg",
        credito: "Las Pozas — Adam Jones · CC BY-SA 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Las_Pozas_-_Edward_James_Surrealist_Garden_-_San_Luis_Potosi_-_Mexico_-_02_(32553055548).jpg"
      },
      {
        nombre: "Real de Catorce",
        descripcion: "Descubre sus calles empedradas, arquitectura histórica y paisajes del Altiplano potosino.",
        imagen: "../../img/lugares/san-luis-potosi-real-de-catorce.jpg",
        credito: "Real de Catorce — Jess fernandez · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Real_de_Catorce,_San_Luis_Potos%C3%AD.jpg"
      }
    ]
  },
  queretaro: {
    nombre: "Querétaro",
    capital: "Querétaro",
    coords: [20.59, -100.39],
    descripcion: "Centro histórico Patrimonio de la Humanidad, Peña de Bernal y la ruta del vino y queso.",
    lugares: [
      {
        nombre: "Centro histórico Patrimonio de la Humanidad",
        descripcion: "Recorre las calles históricas de Querétaro y admira su emblemático acueducto de cantera.",
        imagen: "../../img/lugares/queretaro-centro-historico.jpg",
        credito: "Acueducto de Querétaro — Pabloangulo84 · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Acueducto_de_Quer%C3%A9taro_2.JPG"
      },
      {
        nombre: "Peña de Bernal y la ruta del vino y queso",
        descripcion: "Visita Bernal y contempla uno de los monolitos más grandes del mundo, cerca de viñedos y queserías.",
        imagen: "../../img/lugares/queretaro-pena-de-bernal.jpg",
        credito: "Peña de Bernal — Juan Carlos Fonseca Mata · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Pe%C3%B1a_de_Bernal_(Quer%C3%A9taro,_M%C3%A9xico).jpg"
      }
    ]
  },
  sinaloa: {
    nombre: "Sinaloa",
    capital: "Culiacán",
    coords: [24.81, -107.39],
    imagenPortada: "../../img/lugares/sinaloa-mazatlan-portada.jpg",
    descripcion: "Recorre el malecón de Mazatlán, conoce la histórica Plazuela Machado y disfruta la playa de la Isla de la Piedra.",
    lugares: [
      {
        nombre: "Malecón de Mazatlán",
        descripcion: "Camina junto al Pacífico y contempla el atardecer desde uno de los malecones más largos de México.",
        imagen: "../../img/lugares/sinaloa-mazatlan-portada.jpg",
        credito: "Atardecer en el malecón de Mazatlán — Adam Jones · CC BY 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Sunset_along_the_Malecon_-_Mazatlan_-_Sinaloa_-_Mexico_-_01.jpg"
      },
      {
        nombre: "Plazuela Machado, Centro Histórico",
        descripcion: "Disfruta la arquitectura, los cafés y el ambiente cultural de esta plaza tradicional de Mazatlán.",
        imagen: "../../img/lugares/sinaloa-plazuela-machado.jpg",
        credito: "Plazuela Machado — Gzzz · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Plazuela_Machado_Mazatl%C3%A1n.jpg"
      },
      {
        nombre: "Isla de la Piedra",
        descripcion: "Relájate en sus playas y disfruta la costa y la gastronomía local, a un corto trayecto en lancha desde Mazatlán.",
        imagen: "../../img/lugares/sinaloa-isla-piedra.jpg",
        credito: "Isla de la Piedra — Gzzz · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Isla_de_la_Piedra_(3).jpg"
      }
    ]
  },
  sonora: {
    nombre: "Sonora",
    capital: "Hermosillo",
    coords: [29.07, -110.96],
    imagenPortada: "../../img/lugares/sonora-san-carlos.jpg",
    descripcion: "Descubre San Carlos y el mar de Cortés, la Reserva de la Biosfera El Pinacate y Bahía de Kino.",
    lugares: [
      {
        nombre: "San Carlos y el mar de Cortés",
        descripcion: "Disfruta las playas y los paisajes desérticos de San Carlos, junto al mar de Cortés.",
        imagen: "../../img/lugares/sonora-san-carlos.jpg",
        credito: "San Carlos, Sonora — Victor Hugo de Lafuente Flores · CC BY 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:San_Carlos,_Sonora,_México.jpg"
      },
      {
        nombre: "Reserva de la Biosfera El Pinacate",
        descripcion: "Explora el paisaje volcánico, los cráteres y los campos de lava de esta reserva natural.",
        imagen: "../../img/lugares/sonora-el-pinacate.jpg",
        credito: "Reserva de la Biosfera El Pinacate — Comisión Mexicana de Filmaciones · CC BY-SA 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Reserva_de_la_Biosfera_El_Pinacate,_Sonora-Biosphere_Reserve,_El_Pinacate,_Sonora_(23095506996).jpg"
      },
      {
        nombre: "Bahía de Kino",
        descripcion: "Relájate en las playas del golfo de California y disfruta la costa sonorense.",
        imagen: "../../img/lugares/sonora-bahia-kino.jpg",
        credito: "Bahía de Kino — Comisión Mexicana de Filmaciones · CC BY-SA 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Bahia_de_Kino,_Hermosillo,_Sonora_(23106114122).jpg"
      }
    ]
  },
  tabasco: {
    nombre: "Tabasco",
    capital: "Villahermosa",
    coords: [17.99, -92.93],
    descripcion: "Parque de la Venta con cabezas olmecas y la majestuosa selva del Usumacinta.",
    lugares: [
      {
        nombre: "Parque Museo La Venta",
        descripcion: "Un museo al aire libre entre la selva, famoso por sus cabezas colosales y esculturas olmecas.",
        imagen: "../../img/lugares/tabasco-parque-la-venta.jpg",
        credito: "Colossal Head at Parque-Museo La Venta — Arian Zwegers · CC BY 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Villahermosa,_Parque-Museo_La_Venta,_Colossal_Head_(20686566115).jpg"
      }
    ]
  },
  tamaulipas: {
    nombre: "Tamaulipas",
    capital: "Ciudad Victoria",
    coords: [23.74, -99.14],
    descripcion: "Descubre los bosques y ríos de la Reserva El Cielo, Playa Miramar y la Laguna del Carpintero.",
    lugares: [
      {
        nombre: "Reserva de la Biosfera El Cielo",
        descripcion: "Explora los arroyos y bosques de niebla de esta reserva natural en Gómez Farías.",
        imagen: "../../img/lugares/tamaulipas-el-cielo.jpg",
        credito: "Arroyo en la Reserva El Cielo — William L. Farr · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Cloud_forest_stream_in_El_Cielo_Biosphere_Reserve,_24_September_2003.jpg"
      },
      {
        nombre: "Playa Miramar",
        descripcion: "Disfruta el mar y la arena de esta popular playa en Ciudad Madero.",
        imagen: "../../img/lugares/tamaulipas-playa-miramar.jpg",
        credito: "Playa Miramar — AnbyG · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Playa_Miramar.jpg"
      },
      {
        nombre: "Laguna del Carpintero",
        descripcion: "Pasea junto a la laguna de Tampico y observa sus manglares y fauna local.",
        imagen: "../../img/lugares/tamaulipas-laguna-carpintero.jpg",
        credito: "Laguna del Carpintero — CarolEstefSalas · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Laguna_del_Carpintero_en_Tampico,_Tamaulipas,_Mexico.jpg"
      }
    ]
  },
  tlaxcala: {
    nombre: "Tlaxcala",
    capital: "Tlaxcala",
    coords: [19.32, -98.24],
    descripcion: "El estado más pequeño: murales, pirámides de Cacaxtla y pulque tradicional.",
    lugares: [
      {
        nombre: "Murales del Palacio de Gobierno",
        descripcion: "Admira los murales de Desiderio Hernández Xochitiotzin, que narran la historia de Tlaxcala.",
        imagen: "../../img/lugares/tlaxcala-murales.jpg",
        credito: "Detalle de mural en el Palacio de Gobierno de Tlaxcala — Ajenoalien · CC0",
        fuente: "https://commons.wikimedia.org/wiki/File:Detalle_de_mural_Desiderio_Hern%C3%A1ndez_palacio_de_gobierno_tlaxcala.jpg"
      },
      {
        nombre: "Pirámides de Cacaxtla y pulque tradicional",
        descripcion: "Descubre la zona arqueológica de Cacaxtla y sus antiguos murales, entre los más destacados de Mesoamérica.",
        imagen: "../../img/lugares/tlaxcala-cacaxtla.jpg",
        credito: "Mural de Cacaxtla — CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Mexico.Tlax.Cacaxtla.01.jpg"
      }
    ]
  },
  veracruz: {
    nombre: "Veracruz",
    capital: "Xalapa",
    coords: [19.17, -96.13],
    descripcion: "Cuna del son jarocho, el Tajín, ríos de rápidos y el café de Coatepec.",
    lugares: [
      {
        nombre: "Puerto de Veracruz y son jarocho",
        descripcion: "Disfruta el malecón, la brisa del Golfo y la música tradicional veracruzana.",
        imagen: "../../img/lugares/veracruz-son-jarocho.jpg",
        credito: "Vista del Malecón de Veracruz — Luis Alvaz · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Vista_del_Malec%C3%B3n_de_Veracruz_01.jpg"
      },
      {
        nombre: "El Tajín",
        descripcion: "Explora la antigua ciudad totonaca y la Pirámide de los Nichos, emblema arqueológico de Veracruz.",
        imagen: "../../img/lugares/veracruz-el-tajin.jpg",
        credito: "El Tajín — Juan Carlos Fonseca Mata · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:El_Taj%C3%ADn_(Veracruz)_11.jpg"
      },
      {
        nombre: "Rápidos de Jalcomulco y café de Coatepec",
        descripcion: "Aventura entre los rápidos de Jalcomulco y disfruta el café de la región de Coatepec.",
        imagen: "../../img/lugares/veracruz-jalcomulco.jpg",
        credito: "Río en Jalcomulco — Koffermejia · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Abajo_del_puente_de_Jalcomulco.jpg"
      }
    ]
  },
  zacatecas: {
    nombre: "Zacatecas",
    capital: "Zacatecas",
    coords: [22.77, -102.58],
    descripcion: "Explora su centro histórico colonial, el cerro de la Bufa y la histórica Mina El Edén.",
    lugares: [
      {
        nombre: "Catedral y centro histórico de Zacatecas",
        descripcion: "Admira la fachada barroca de la catedral y pasea por las calles del centro histórico.",
        imagen: "../../img/lugares/zacatecas-catedral.jpg",
        credito: "Catedral de Zacatecas — Vaquita marina · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Catedral_de_Zacatecas,_Zacatecas.jpg"
      },
      {
        nombre: "Cerro de la Bufa",
        descripcion: "Sube al emblemático cerro para disfrutar sus vistas panorámicas de la ciudad.",
        imagen: "../../img/lugares/zacatecas-cerro-bufa.jpg",
        credito: "Centro de Zacatecas desde el Cerro de la Bufa — JavierDo · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Zacatecas_Centro_desde_Cerro_de_la_Bufa_-_panoramio.jpg"
      },
      {
        nombre: "Mina El Edén",
        descripcion: "Conoce la historia minera de Zacatecas recorriendo los túneles de esta antigua mina.",
        imagen: "../../img/lugares/zacatecas-mina-eden.jpg",
        credito: "Mina El Edén — JavierDo · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Mina_El_Ed%C3%A9n_-_panoramio.jpg"
      }
    ]
  },

  /* ---------- ESTADOS CON DATOS COMPLETOS ---------- */

  jalisco: {
    nombre: "Jalisco", capital: "Guadalajara", coords: [20.66, -103.35],
    descripcion: "Cuna del tequila y el mariachi, Puerto Vallarta y el hermoso Lago de Chapala.",
    hoteles: [
      { nombre: "Hotel Demetria", tipo: "HOTEL", precio: "$1,850", calificacion: "4.6", ubicacion: "Guadalajara, Jalisco", descripcion: "Hotel boutique con diseño contemporáneo cerca de la Avenida Chapultepec." },
      { nombre: "Casa Karma Boutique", tipo: "BOUTIQUE", precio: "$2,400", calificacion: "4.8", ubicacion: "Puerto Vallarta, Jalisco", descripcion: "Vistas a la bahía de Banderas, alberca infinita y desayuno incluido." }
    ],
    restaurantes: [
      { nombre: "La Chata de Guadalajara", tipo: "MEXICANA", precio: "$280", calificacion: "4.7", ubicacion: "Centro Histórico, Guadalajara", descripcion: "Tortas ahogadas, pozole y cocina tapatía de toda la vida." },
      { nombre: "La Tequila Cocina de Autor", tipo: "AUTOR", precio: "$650", calificacion: "4.6", ubicacion: "Guadalajara, Jalisco", descripcion: "Alta cocina jalisciense con maridaje de tequilas artesanales." }
    ],
    lugares: [
      {
        nombre: "Centro Histórico de Guadalajara",
        descripcion: "Catedral, Hospicio Cabañas con murales de Orozco y Plaza de los Mariachis.",
        imagen: "../../img/lugares/jalisco-guadalajara.jpg",
        credito: "Catedral metropolitana de Guadalajara — ProtoplasmaKid · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Catedral_metropolitana_de_Guadalajara_01.jpg"
      },
      {
        nombre: "Tequila, Jalisco",
        descripcion: "Pueblo Mágico donde nace el tequila: haciendas, destilerías y campos agaveros.",
        imagen: "../../img/lugares/jalisco-tequila.jpg",
        credito: "Paisaje agavero de Tequila — Juan Carlos Fonseca Mata · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Paisaje_agavero_(Tequila,_Jalisco)_1.jpg"
      },
      {
        nombre: "Malecón de Puerto Vallarta",
        descripcion: "Playas, arte callejero y atardeceres frente a la bahía de Banderas.",
        imagen: "../../img/lugares/jalisco-puerto-vallarta.jpg",
        credito: "Malecón de Puerto Vallarta — Another Believer · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Malec%C3%B3n,_Puerto_Vallarta,_February_2023.jpg"
      }
    ]
  },

  "quintana-roo": {
    nombre: "Quintana Roo", capital: "Chetumal", coords: [18.50, -88.30],
    descripcion: "Cancún, Tulum frente al mar, cenotes y la gran barrera maya de coral.",
    hoteles: [
      { nombre: "Hotel NYX Cancún", tipo: "RESORT", precio: "$3,200", calificacion: "4.7", ubicacion: "Zona Hotelera, Cancún", descripcion: "Frente al mar Caribe con alberca infinita y club de playa." },
      { nombre: "Cabañas Tulum Beach", tipo: "CABAÑA", precio: "$1,500", calificacion: "4.5", ubicacion: "Tulum, Quintana Roo", descripcion: "Cabañas ecológicas sobre la arena con acceso directo al mar." }
    ],
    restaurantes: [
      { nombre: "La Habichuela", tipo: "MARISCOS", precio: "$480", calificacion: "4.8", ubicacion: "Centro, Cancún", descripcion: "Mariscos y cocina caribeña en un jardín mágico desde 1977." },
      { nombre: "Restaurante Arca", tipo: "AUTOR", precio: "$700", calificacion: "4.7", ubicacion: "Tulum, Quintana Roo", descripcion: "Cocina de autor con fuego, productos locales y ambiente selvático." }
    ],
    lugares: [
      {
        nombre: "Zona Arqueológica de Tulum",
        descripcion: "Ruinas mayas acantiladas frente al mar Caribe, de las vistas más fotografiadas de México.",
        imagen: "../../img/lugares/quintana-roo-tulum.jpg",
        credito: "Zona Arqueológica de Tulum — ERVIN ESCOBAR · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:ZONA_ARQUEOLOGICA_DE_TULUM_-_panoramio.jpg"
      },
      {
        nombre: "Cenote Dos Ojos",
        descripcion: "Cenote de agua cristalina ideal para snorkel y buceo en caverna.",
        imagen: "../../img/lugares/quintana-roo-cenote-dos-ojos.jpg",
        credito: "Cenote Dos Ojos - 5 — eugene_o · CC BY 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:20230324_-_Cenote_Dos_Ojos_-_5.jpg"
      },
      {
        nombre: "Isla Mujeres",
        descripcion: "Playas de arena suave, el Parque Garrafón y travesías en barco desde Cancún.",
        imagen: "../../img/lugares/quintana-roo-isla-mujeres.jpg",
        credito: "Hermosa Caleta beach Isla Mujeres QR 01 — Bernard DUPONT · CC BY-SA 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Hermosa_Caleta_beach_Isla_Mujeres_QR_01.jpg"
      }
    ]
  },

  guanajuato: {
    nombre: "Guanajuato", capital: "Guanajuato", coords: [21.02, -101.26],
    descripcion: "Callejones mágicos, las momias de Guanajuato, San Miguel de Allende y fiestas coloridas.",
    hoteles: [
      { nombre: "Hotel Villa María Cristina", tipo: "BOUTIQUE", precio: "$2,100", calificacion: "4.7", ubicacion: "Guanajuato Capital", descripcion: "Hacienda del siglo XIX transformada en hotel boutique con patio colonial." },
      { nombre: "Casa de Sierra Nevada", tipo: "BOUTIQUE", precio: "$3,500", calificacion: "4.8", ubicacion: "San Miguel de Allende", descripcion: "Mansión colonial con spa, restaurant de autor y rooftop con vistas." }
    ],
    restaurantes: [
      { nombre: "La Trinidad", tipo: "MEXICANA", precio: "$350", calificacion: "4.6", ubicacion: "Guanajuato Capital", descripcion: "Cocina guanajuatense contemporánea en una antigua casona minera." },
      { nombre: "Restaurante Don Tage", tipo: "INTERNACIONAL", precio: "$420", calificacion: "4.5", ubicacion: "San Miguel de Allende", descripcion: "Terraza con vista al jardín y cortes a la parrilla." }
    ],
    lugares: [
      { nombre: "Callejón del Beso", descripcion: "El callejón más famoso de México, con balcones a 68 cm de distancia." },
      { nombre: "Museo de las Momias", descripcion: "Una de las exposiciones más singulares del mundo, ícono de Guanajuato." },
      { nombre: "Parroquia de San Miguel Arcángel", descripcion: "Ícono gótico de San Miguel de Allende en el corazón del centro histórico." }
    ]
  },

  yucatan: {
    nombre: "Yucatán", capital: "Mérida", coords: [20.97, -89.62],
    descripcion: "Chichén Itzá, cenotes cristalinos, Mérida blanca y la ruta puuc.",
    hoteles: [
      { nombre: "Hotel Casa Azul", tipo: "BOUTIQUE", precio: "$1,700", calificacion: "4.6", ubicacion: "Centro, Mérida", descripcion: "Casona yucateca restaurada a pasos de la Plaza Grande." },
      { nombre: "Hacienda Uayamón", tipo: "HACIENDA", precio: "$2,900", calificacion: "4.8", ubicacion: "Campeche (ruta puuc)", descripcion: "Antigua hacienda henequenera con suites y chapoteadero." }
    ],
    restaurantes: [
      { nombre: "La Chaya Maya", tipo: "YUCATECA", precio: "$260", calificacion: "4.7", ubicacion: "Mérida, Yucatán", descripcion: "Cochinita pibil, papadzules y sopa de lima auténticos." },
      { nombre: "Ku'uk", tipo: "AUTOR", precio: "$850", calificacion: "4.8", ubicacion: "Mérida, Yucatán", descripcion: "Alta cocina maya con técnicas modernas y maíz como protagonista." }
    ],
    lugares: [
      {
        nombre: "Chichén Itzá",
        descripcion: "Una de las nuevas 7 maravillas del mundo: el Templo de Kukulkán y el cenote sagrado.",
        imagen: "../../img/lugares/yucatan-chichen-itza.jpg",
        credito: "Pirámide de Kukulkán — Altairisfar · Dominio público",
        fuente: "https://commons.wikimedia.org/wiki/File:Pyramid_of_Kukulkan_Chichen_Itza_01.JPG"
      },
      {
        nombre: "Paseo de Montejo",
        descripcion: "El paseo más elegante de Mérida, con mansiones y museos.",
        imagen: "../../img/lugares/yucatan-paseo-de-montejo.jpg",
        credito: "Monumento Felipe Carrillo Puerto — Sharon Hahn Darlin · CC BY 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Monumento_Felipe_Carrillo_Puerto,_Paseo_de_Montejo,_Merida,_Yucatan,_Mexico.jpg"
      },
      {
        nombre: "Cenote Ik Kil",
        descripcion: "Cenote abierto rodeado de selva, a minutos de Chichén Itzá.",
        imagen: "../../img/lugares/yucatan-cenote-ik-kil.jpg",
        credito: "Cenote Ik Kil — Shinya Suzuki · CC BY 2.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Cenote_Ik_Kil,_Yucatan,_Dec_2011_-_06.jpg"
      }
    ]
  },

  puebla: {
    nombre: "Puebla", capital: "Puebla", coords: [19.04, -98.20],
    descripcion: "Talavera, mole poblano, Cholula con su pirámide y el hermoso centro histórico.",
    hoteles: [
      { nombre: "Hotel Cartesiano", tipo: "BOUTIQUE", precio: "$2,300", calificacion: "4.7", ubicacion: "Centro Histórico, Puebla", descripcion: "Antigua fábrica de cerámica convertida en hotel de lujo." },
      { nombre: "La Purificadora", tipo: "BOUTIQUE", precio: "$1,950", calificacion: "4.5", ubicacion: "Centro, Puebla", descripcion: "Hotel de diseño en un edificio industrial patrimonial." }
    ],
    restaurantes: [
      { nombre: "El Mural de los Poblanos", tipo: "POBLANA", precio: "$380", calificacion: "4.7", ubicacion: "Centro Histórico, Puebla", descripcion: "Mole poblano, chiles en nogada y mezcales de la sierra." },
      { nombre: "La Casa del Mendrugo", tipo: "AUTOR", precio: "$620", calificacion: "4.8", ubicacion: "Centro, Puebla", descripcion: "Cocina novohispana en una casona del siglo XVII." }
    ],
    lugares: [
      {
        nombre: "Gran Pirámide de Cholula",
        descripcion: "La pirámide más grande del mundo por volumen, con la iglesia de los Remedios arriba.",
        imagen: "../../img/lugares/puebla-cholula.jpg",
        credito: "Gran Pirámide de Cholula — Diego Delso · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Gran_Pir%C3%A1mide_de_Cholula,_Puebla,_M%C3%A9xico,_2013-10-12,_DD_03.JPG"
      },
      {
        nombre: "Catedral de Puebla",
        descripcion: "Una de las catedrales más imponentes de México en el zócalo poblano.",
        imagen: "../../img/lugares/puebla-catedral.jpg",
        credito: "Catedral Basílica de Puebla — Juan Carlos Fonseca Mata · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Catedral_Bas%C3%ADlica_de_Puebla_(M%C3%A9xico).jpg"
      },
      {
        nombre: "Callejón de los Sapos",
        descripcion: "Barrio de antigüedades, cafés y leyendas en el centro histórico.",
        imagen: "../../img/lugares/puebla-callejon-sapos.jpg",
        credito: "Callejón de los Sapos — Gusvel · CC BY-SA 4.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Callej%C3%B3n_de_los_sapos.JPG"
      }
    ]
  },

  "ciudad-de-mexico": {
    nombre: "Ciudad de México", capital: "Ciudad de México", coords: [19.43, -99.13],
    descripcion: "Museos, el Zócalo, Teotihuacán cerca y una de las mejores gastronomías del mundo.",
    hoteles: [
      { nombre: "Hotel Zócalo Central", tipo: "HOTEL", precio: "$1,900", calificacion: "4.6", ubicacion: "Zócalo, CDMX", descripcion: "Vistas frontales a la Catedral y al Zócalo desde el rooftop." },
      { nombre: "Las Alcobas", tipo: "BOUTIQUE", precio: "$3,800", calificacion: "4.8", ubicacion: "Polanco, CDMX", descripcion: "Hotel de lujo sobre la avenida más elegante de Polanco." }
    ],
    restaurantes: [
      { nombre: "El Cardenal", tipo: "MEXICANA", precio: "$450", calificacion: "4.8", ubicacion: "Centro Histórico, CDMX", descripcion: "Desayunos legendarios: nata, mole y chocolate a la mexicana." },
      { nombre: "Contramar", tipo: "MARISCOS", precio: "$700", calificacion: "4.8", ubicacion: "Roma Norte, CDMX", descripcion: "El restaurante de mariscos más celebrado de la ciudad." }
    ],
    lugares: [
      {
        nombre: "Museo Nacional de Antropología",
        descripcion: "Descubre la Piedra del Sol y las colecciones de las culturas prehispánicas de México.",
        imagen: "../../img/lugares/cdmx-museo-antropologia.jpg",
        credito: "Manuel de Corselas · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Piedra_del_Sol._Museo_Nacional_de_Antropolog%C3%ADa,_M%C3%A9xico._MPLC_01.jpg"
      },
      {
        nombre: "Teotihuacán",
        descripcion: "Recorre la antigua ciudad y admira la Pirámide del Sol y la Pirámide de la Luna.",
        imagen: "../../img/lugares/cdmx-teotihuacan.jpg",
        credito: "Daniel Case · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Pyramid_of_the_Sun,_Teotihuacan,_from_path_to_parking_lot.jpg"
      },
      {
        nombre: "Xochimilco",
        descripcion: "Navega en trajinera por los canales históricos de Xochimilco, patrimonio de la humanidad.",
        imagen: "../../img/lugares/cdmx-xochimilco.jpg",
        credito: "Juan Carlos Fonseca Mata · CC BY-SA 3.0",
        fuente: "https://commons.wikimedia.org/wiki/File:Trajinera_de_Xochimilco_-_Ciudad_de_M%C3%A9xico.jpg"
      }
    ]
  },


    /* ---------- PLANTILLA PARA LOS DEMÁS ESTADOS ---------- */

  plantilla: function (valor) {
    const base = this[valor];

    if (!base || !base.nombre || !base.descripcion) return null;

    const capital = base.capital;
    const atracciones = base.descripcion
      .split(",")
      .map((parte) => parte.replace(/\s+y\s*$|\.$/g, "").trim())
      .filter(Boolean);

    return Object.assign({}, base, {
      hoteles: [
        {
          nombre: `Hotel Central ${capital}`,
          tipo: "HOTEL",
          precio: "$950",
          calificacion: "4.3",
          ubicacion: `Centro, ${capital}`,
          descripcion: `Hospedaje cómodo y bien ubicado para conocer ${base.nombre}.`
        },
        {
          nombre: `Cabañas y Suites ${base.nombre}`,
          tipo: "CABAÑA",
          precio: "$800",
          calificacion: "4.5",
          ubicacion: base.nombre,
          descripcion: `Ambiente tranquilo rodeado de naturaleza, ideal para descansar en ${base.nombre}.`
        }
      ],
      restaurantes: [
        {
          nombre: "Restaurante La Capital",
          tipo: "MEXICANA",
          precio: "$250",
          calificacion: "4.4",
          ubicacion: capital,
          descripcion: `Comida mexicana tradicional con lo mejor de la cocina de ${base.nombre}.`
        },
        {
          nombre: `Mercado Municipal de ${capital}`,
          tipo: "MERCADO",
          precio: "$120",
          calificacion: "4.2",
          ubicacion: capital,
          descripcion: "Antojitos locales, frutas de temporada y sabor auténtico."
        }
      ],
      lugares: base.lugares || atracciones.slice(0, 3).map((texto) => ({
        nombre: texto.charAt(0).toUpperCase() + texto.slice(1),
        descripcion: `Un imperdible de ${base.nombre} que no te puedes perder.`
      }))
    });
  },


  obtener: function (valor) {
    return this[valor] || null;
  }

};
