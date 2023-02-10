const pronouns = ["yo", "tú", "él", "ella", "usted", "nosotros", "vosotros", "ellos", "ustedes"];
const pronounMap = {
    "yo": {
        reflexive: "me",
        boot: true,
        english: "I"
    },
    "tú": {
        reflexive: "te",
        boot: true,
        english: "you"
        
    },
    "él": {
        reflexive: "se",
        boot: true,
        english: "he"
    },
    "ella": {
        reflexive: "se",
        boot: true,
        english: "she"

    },
    "usted": {
        reflexive: "se",
        boot: true,
        english: "you"
    },
    "nosotros": {
        reflexive: "nos",
        boot: false,
        english: "we"
    },
    "vosotros": {
        reflexive: "os",
        boot: false,
        english: "you"
    },
    "ellos": {
        reflexive: "se",
        boot: true,
        english: "they"
    },
    "ustedes": {
        reflexive: "se",
        boot: true,
        english: "you"
    }
}

const endingTable = {
    "ar": {
        "yo": "o",
        "tú": "as",
        "él": "a",
        "ella": "a",
        "usted": "a",
        "nosotros": "amos",
        "vosotros": "áis",
        "ellos": "an",
        "ustedes": "an"
    },
    "er": {
        "yo": "o",
        "tú": "es",
        "él": "e",
        "ella": "e",
        "usted": "e",
        "nosotros": "emos",
        "vosotros": "éis",
        "ellos": "en",
        "ustedes": "en"
    },
    "ir": {
        "yo": "o",
        "tú": "es",
        "él": "e",
        "ella": "e",
        "usted": "e",
        "nosotros": "imos",
        "vosotros": "ís",
        "ellos": "en",
        "ustedes": "en"
    },
}

const reflexiveList = (`
    acostarse (o-ue) to go to bed
    afeitarse to shave
    arreglarse to get ready
    bañarse to take a bath, to bathe
    cansarse (de) to get tired (of)
    casarse to get married (to)
    cortarse to cut onself, to get cut (hair)
    despedirse (e-i) to say goodbye to
    despertarse (e-ie) to wake up
    ducharse to take a shower
    enfermarse to get sick
    lastimarse to hurt oneself
    lavarse to wash
    llamarse to call oneself
    levantarse to get up
    peinarse to comb one's hair
    ponerse to get dressed
    quedarse to stay
    quitarse to take off (clothing)
    secarse to dry
    sentarse (e-ie) to sit down
    sentirse (e-ie) to feel
`);

let reflexiveWords = reflexiveList.trim().split('\n').map(x => {
    let res = x.trim().split(" ");
    var irr = res[1].split('-').length > 1 ? res[1].slice(1, -1).split('-') : false;

    return {
        word: res[0],
        irregular: irr.length ? irr : false,
        english: irr.length ? res.slice(2, res.length ) : res.slice(1, res.length ),
    }

    return res;
});

function conjugateReflexive(reflexiveVerb, pronoun, irregular){
    // get the pronoun prefix (me/te/se) object
    const pronounPrefix = pronounMap[pronoun];

    // replace appropriate letters in irregular verb
    reflexiveVerb = irregular &&  pronounPrefix.boot? 
        reflexiveVerb.replace(irregular[0], irregular[1]) : reflexiveVerb;

    // find the base infinitive verb (non-reflexive like "hablar"), remove the "se"
    const baseVerbInfinitive = reflexiveVerb.slice(0, -2);

    // remove the "ar/er/ir"
    const baseVerb = baseVerbInfinitive.slice(0, -2);

    // get the verb type (ar/er/ir)
    const verbType = baseVerbInfinitive.slice(-2);

    // get the conjugated ending for the verb
    const ending = endingTable[verbType][pronoun];

    if (pronounPrefix.reflexive && baseVerb && ending){
        // return the conjugated verb with pronoun "me lavo"
        return (pronounPrefix.reflexive) + " " + (baseVerb + ending);
    } else {
        throw new Error("Could not conjugate verb");
    }
}

export {
    pronouns, reflexiveWords, conjugateReflexive, pronounMap
}