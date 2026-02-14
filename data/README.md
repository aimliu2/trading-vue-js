# Aggregate Chart Data format
When building the chart using [Datacube](../src/helpers/datacube.js), the data should respect the example format below;


### Version 1.1 - Modern format
Complete JSON format
```JSON
{
    "_comment" : "JSON comment", // optional
    "chart": {
        "type": "Candles",
        "tf": "D",
        "data": [
            [
                1584712800000,
                248.235,
                251.79,
                248.165,
                251.51,
                88668
            ],
            [
                1584716400000,
                251.53,
                251.53,
                248.19,
                248.535,
                191785
            ],
            ...
            [
                1595358000000,
                391.385,
                391.595,
                387.08,
                388.22,
                53531
            ]
        ]
    },
    "onchart": [ // onchart location the same frame with OHLCV
        {
            "name": "EMA, 25", // overlay name
            "type": "EMA", // overlay type (wwCals indicator) --> caculated first --> rendered with respective component
            "data": [],
            "settings": {} // settings of this overlay
        },
        ... // other onchart overlay
    ],
    "offchart": [ // onchart location the diff frame apart from OHLCV
        {
            "name": "RSI, 20", // overlay name
            "type": "RSI:preCalc", // overlay type (preCalc indicator)--> send to resposible component
            "data": [
                [
                    1570586400000,
                    38.834352635325224
                ],
                [
                    1570590000000,
                    35.66096042520246
                ],
                ...
                [
                    1572022800000,
                    87.95054865340519
                ]
            ],
            "settings": {
                "upper": 70,
                "lower": 30,
                "backColor": "#9b9ba316",
                "bandColor": "#666"
            }
        },
        ... // other onchart overlay
    ],
    "tools": [ // tools overlay
        {
            "type": "LineTool",
            "settings": {
                "color": "#35c460"
            }
        },
        {
            "type": "LineTool:Extended",
            "settings": {
                "color": "#3186c4"
            }
        },
        {
            "type": "LineTool:Ray",
            "settings": {
                "color": "#c43169"
            }
        }
    ]
}
```

### Legacy format
Still support legacy JSON input with "ohlcv" as key
```JSON
{
    "ohlcv": [
        [
            1603037160000,
            11442.5,
            11448.5,
            11442.5,
            11448.5,
            118376.12
        ],
        ...
    ]
}
```



# TODO
- build normalizer handling incomplete data, i.e. only close, no vol, or more than ohlcv