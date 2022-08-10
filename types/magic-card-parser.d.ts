declare module 'magic-card-parser' {
    
    export type CardInfo = {
        name: String;
        oracle_text: String
    }

    export type ParseResult = {
        card: CardInfo;
        error: String;
        oracleText: String;
        result: Array<any>;
    }

    function parseCard(card: CardInfo) : ParseResult;
}