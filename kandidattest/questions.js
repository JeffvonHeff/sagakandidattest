// Skala: -2 helt uenig, -1 delvist uenig, 0 neutral, 1 delvist enig, 2 helt enig
// weight: brugers vægt per spørgsmål gemmes separat. Her er kun defaultWeight.

window.QUIZ_DATA = {
  quizId: "saga-template-001",
  title: "Kandidattest",
  questions: [

    { id: "q1", topic: "Forsvar og sikkerhed", text: "Staten bør have mulighed for at indføre overvågning af borgernes private kommunikation for at forebygge kriminalitet og terror.", explain: "Overvågning af digital kommunikation kan fx omfatte registrering af telefonopkald, sms’er og internettrafik. I Danmark findes regler om telelogning og signalefterretning i arbejdet mod terror og alvorlig kriminalitet.", defaultWeight: 2 },

    { id: "q2", topic: "Forsvar og sikkerhed", text: "Danmark bør øge forsvarsbudgettet - også hvis det betyder færre penge til andre områder.", explain: "NATO har en målsætning om, at medlemslande bruger mindst 2% af BNP på forsvar. Efter Ruslands invasion af Ukraine har flere lande øget deres forsvarsudgifter.", defaultWeight: 2 },

    { id: "q3", topic: "Bolig", text: "Der bør bygges flere billige studieboliger i de større byer.", explain: "I flere af Danmarks største studiebyer er der mangel på studieboliger. Samtidig er boligudgifterne høje.", defaultWeight: 2 },

    { id: "q4", topic: "Bolig", text: "Staten bør regulere boligmarkedet for at gøre det lettere for unge og førstegangskøbere at komme ind på boligmarkedet.", explain: "Boligpriserne har i perioder været stigende i flere danske byer.", defaultWeight: 2 },

    { id: "q5", topic: "Bolig", text: "Huslejestigninger bør i højere grad reguleres ved lov.", explain: "Huslejen er steget i mange danske byer de seneste år.", defaultWeight: 2 },

    { id: "q6", topic: "Udlændinge og integration", text: "Danmarks udlændingepolitik bør strammes.", explain: "Danmarks udlændingepolitik omfatter regler om bl.a. asyl og opholdstilladelser.", defaultWeight: 2 },

    { id: "q7", topic: "Udlændinge og integration", text: "Danmark bør gennemføre udvisninger af kriminelle udlændinge, også selvom det strider mod Den Europæiske Menneskerettighedskonvention.", explain: "Den Europæiske Menneskerettighedskonvention kan i nogle tilfælde begrænse muligheden for at udvise udlændinge.", defaultWeight: 2 },

    { id: "q8", topic: "Klima, miljø og grøn omstilling", text: "Beskyttelsen af rent drikkevand bør prioriteres højere end landbrugets interesser.", explain: "Størstedelen af drikkevand i Danmark kommer fra grundvand.", defaultWeight: 2 },

    { id: "q9", topic: "Klima, miljø og grøn omstilling", text: "Den grønne omstilling bør gennemføres, også hvis det kan svække dansk konkurrenceevne.", explain: "Den grønne omstilling indebærer nye klima- og miljøkrav til energi, produktion og transport.", defaultWeight: 2 },

    { id: "q10", topic: "Klima, miljø og grøn omstilling", text: "Kravene til svineproduktionen bør skærpes - også hvis det gør dansk landbrug mindre konkurrencedygtigt.", explain: "Svineproduktion i Danmark er reguleret gennem miljø- og dyrevelfærdsregler.", defaultWeight: 2 },

    { id: "q11", topic: "Klima, miljø og grøn omstilling", text: "Danmark bør fremrykke målet om klimaneutralitet fra 2045 til 2035.", explain: "Danmarks klimalov har et mål om klimaneutralitet senest i 2045.", defaultWeight: 2 },

    { id: "q12", topic: "EU, international politik og solidaritet", text: "Danmark bør styrke samarbejdet i EU - også hvis det betyder mindre national selvbestemmelse.", explain: "EU er et politisk og økonomisk samarbejde mellem 27 europæiske lande.", defaultWeight: 2 },

    { id: "q13", topic: "EU, international politik og solidaritet", text: "Danmark bør øge den humanitære hjælp til mennesker ramt af krig og konflikter - også hvis det kræver omprioriteringer i de offentlige udgifter.", explain: "Humanitær bistand er akut hjælp til mennesker ramt af krig eller naturkatastrofer.", defaultWeight: 2 },

    { id: "q14", topic: "EU, international politik og solidaritet", text: "Danmark bør anerkende Palæstina som stat.", explain: "Over 150 FN-lande har anerkendt Palæstina som stat.", defaultWeight: 2 },

    { id: "q15", topic: "Uddannelse", text: "Reformer, der forkorter uddannelser, lægger et for stort pres på studerende og går ud over unges trivsel.", explain: "Regeringen vedtog i 2023 en reform med kortere kandidatuddannelser.", defaultWeight: 2 },

    { id: "q16", topic: "Uddannelse", text: "Det 6. SU-år bør genindføres.", explain: "SU gives normalt til normeret studietid plus op til 12 ekstra måneder.", defaultWeight: 2 },

    { id: "q17", topic: "Uddannelse", text: "SU’en bør hæves for at følge de stigende leveomkostninger for studerende.", explain: "SU reguleres årligt og udgjorde over 7.000 kr. om måneden i 2025.", defaultWeight: 2 },

    { id: "q18", topic: "Retspolitik og tryghed", text: "Straffen for personfarlig kriminalitet (fx voldtægt og grov vold) bør skærpes.", explain: "Personfarlig kriminalitet omfatter fx vold og voldtægt.", defaultWeight: 2 },

    { id: "q19", topic: "Retspolitik og tryghed", text: "Sociale medier bør reguleres strengere for at beskytte børn og unge mod skadeligt indhold.", explain: "EU’s Digital Services Act stiller krav til onlineplatforme.", defaultWeight: 2 },

    { id: "q20", topic: "Demokrati", text: "Der bør indføres strengere regler for lobbyisme i dansk politik.", explain: "Lobbyisme er forsøg på at påvirke politiske beslutninger.", defaultWeight: 2 },

    { id: "q21", topic: "Demokrati", text: "Stemmeretsalderen bør sænkes til 16 år.", explain: "Stemmeretsalderen i Danmark er 18 år.", defaultWeight: 2 },

    { id: "q22", topic: "Sundhed og trivsel", text: "Ventetiden på udredning af børne og unge i psykiatrien bør nedbringes - også hvis det kræver at det offentlige i højere grad gør brug af private behandlere.", explain: "Børn og unge kan henvises til psykiatrisk udredning gennem egen læge.", defaultWeight: 2 },

    { id: "q23", topic: "Sundhed og trivsel", text: "Ordningen med gratis psykologhjælp til 18–24-årige med mild til moderat angst eller depression bør udvides til at omfatte flere aldersgrupper.", explain: "Gratis psykologhjælp til unge forventes indført i 2026.", defaultWeight: 2 },

    { id: "q24", topic: "Skat, afgifter, økonomi og arbejdsmarked", text: "AI bør reguleres politisk for at beskytte unges jobsikkerhed.", explain: "AI kan påvirke job med rutineopgaver.", defaultWeight: 2 },

    { id: "q25", topic: "Skat, afgifter, økonomi og arbejdsmarked", text: "At styrke Danmarks konkurrenceevne og økonomiske vækst bør prioriteres højere end at reducere økonomisk ulighed.", explain: "Konkurrenceevne handler om virksomheders evne til at konkurrere internationalt.", defaultWeight: 2 },

    { id: "q26", topic: "Skat, afgifter, økonomi og arbejdsmarked", text: "Investeringer i uddannelse bør prioriteres højere end skattelettelser.", explain: "Offentlige udgifter til uddannelse omfatter skoler og videregående uddannelser.", defaultWeight: 2 },

    { id: "q27", topic: "Skat, afgifter, økonomi og arbejdsmarked", text: "Der bør indføres formueskat for at reducere økonomisk ulighed.", explain: "Danmark havde formueskat frem til 1997.", defaultWeight: 2 },

    { id: "q28", topic: "Værdipolitik, ligestilling og repræsentation", text: "Der bør gennemføres politiske tiltag for at mindske polarisering og had i den offentlige debat.", explain: "Had i offentlig debat kan omfatte trusler og chikane.", defaultWeight: 2 },

    { id: "q29", topic: "Værdipolitik, ligestilling og repræsentation", text: "Der bør iværksættes tiltag for at øge repræsentationen af køn og minoriteter i politik.", explain: "Kvinder udgør omkring 43% af Folketingets medlemmer.", defaultWeight: 2 },

    { id: "q30", topic: "Værdipolitik, ligestilling og repræsentation", text: "Skoler og uddannelsesinstitutioner bør gøre mere for at sikre trivsel for LGBT+-elever.", explain: "Trivselsmålinger viser lavere trivsel blandt nogle LGBT+-elever.", defaultWeight: 2 }

  ]
};