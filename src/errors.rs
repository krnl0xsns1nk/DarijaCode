use crate::tokens::*;
use std::fs::read_to_string;

pub struct CompilerError {
    pub er: Er,
    pub span: Span,
    pub info: Option<String>
}

impl CompilerError {
pub fn info(mut self, info: impl Into<String>) -> Self {
    self.info = Some(info.into());
    self
}
}
pub fn show_err(filename: &str, err: CompilerError) {
    let src = match read_to_string(filename) {
        Ok(src) =>  src,
        Err(_err) => return eprintln!("DCE1: lmilf myanch"),
    };

    let before = &src[..err.span.start];
    let line_number = before.lines().count();
    let line = src.lines().nth(line_number -1).unwrap_or("");
    let line_start = before.rfind('\n').map(|pos| pos+1).unwrap_or(0);
    let column = err.span.start - line_start;
    let info = match err.info {
        Some(info) => format!(": {}", info),
        None => String::new(),
    };

    eprintln!("\x1b[2m---> \x1b[0m\x1b[4m\x1b[96m{}\x1b[0m:\x1b[2m{}:{}\x1b[0m", filename, line_number, column + 1);
    eprintln!("\x1b[31m4alat[{}]\x1b[0m: {}{}", err.er.code(), err.er.title(), info);
    eprintln!("  |");
    eprintln!("{} |{}",line_number, line);
    eprintln!("  |\x1b[31m{}^\x1b[0m", " ".repeat(column));
}

pub enum Er {
    FileNotFound,
    UnknownSymbol,
    InvalidFloat,
    UnknownType,
    UnCompletString,
    NewLineString,
    UnExpectedToken,
    NeedExpr,
    InvalidNumber,
    InvalidValue,
    ALotOfExpr,
    NeedStmt,
}
impl Er {
    pub fn code(&self) -> &'static str {
        match self {
            Self::FileNotFound => "DCE1",
            Self::UnknownSymbol => "DCE2",
            Self::InvalidFloat => "DCE3",
            Self::UnknownType => "DCE4",
            Self::UnCompletString => "DCE5",
            Self::NewLineString => "DCE6",
            Self::UnExpectedToken => "DCE7",
            Self::NeedExpr => "DCE8",
            Self::InvalidNumber => "DCE9",
            Self::InvalidValue => "DCE10",
            Self::ALotOfExpr => "DCE11",
            Self::NeedStmt => "DCE12",
        }
    }
    pub fn title(&self) -> &'static str {
        match self {
            Self::FileNotFound => "lmilf mkaynch, 7awl tchof mzyan",
            Self::UnknownSymbol => "had rramz mm3rofch 3ndna",
            Self::InvalidFloat => "hada machi ra9m m9ad",
            Self::UnknownType => "hada machi naw3 m3rof 3ndna",
            Self::UnCompletString => "had nass mamkmolch, khado isali bwahda mn hado: \" awla \' awla `, (bdakchi li bditi bih nnass dyalk)",
            Self::NewLineString => "chi nass badi b \" maymknch irje3 lstr, so howa lwl awla st3ml: ` awla ' ",
            Self::UnExpectedToken => "mknach mtw93in mnk had ramz/lklma, dir chi haja akhra awla chof fin kayn lmoxkil",
            Self::NeedExpr => "na9sk chi ta3bir hna awla chi 9ima",
            Self::InvalidNumber => "hada machi 3dd m9ad, n3l chitan",
            Self::InvalidValue => "hadi machi 9ima m9ada, dir chi 9ima b39lha bhal chi nss chi 3dd etc...",
            Self::ALotOfExpr => "drti bzaf dyal ta3abir ldarajat hadchi mmsmo7x",
            Self::NeedStmt => "na9sk chi t3lima awla 2mr barmaji s7i7",
        }
    }
}
