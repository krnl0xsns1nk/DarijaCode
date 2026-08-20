use crate::lexer::tokens::*;
use colored::Colorize;
use std::fs::read_to_string;

#[derive(Debug)]
pub struct CompilerError {
    pub er: Er,
    pub span: Span,
    pub info: Option<String>,
}

impl CompilerError {
    pub fn info(mut self, info: impl Into<String>) -> Self {
        self.info = Some(info.into());
        self
    }
}
pub fn show_err(filename: &str, err: CompilerError) {
    let src = match read_to_string(filename) {
        Ok(src) => src,
        Err(_err) => return eprintln!("DCE1: lmilf myanch"),
    };

    let before = &src[..err.span.start];
    let line_number = src[..err.span.start]
        .bytes()
        .filter(|&byte| byte == b'\n')
        .count()
        + 1;
    //    let line_number = before.lines().count();
    let line = src.lines().nth(line_number - 1).unwrap_or("");
    let line_start = before.rfind('\n').map(|pos| pos + 1).unwrap_or(0);
    let column = err.span.start - line_start;
    let end_column = err.span.end - line_start;
    let width = (end_column - column).max(1);

    let info = match err.info {
        Some(info) => format!(": {}", info),
        None => String::new(),
    };

    eprintln!(
        "{}{}:{}:{}",
        "---> ".bright_black(),
        filename.cyan().bold().underline(),
        line_number.to_string().bright_black(),
        (column + 1).to_string().bright_black()
    );
    eprintln!(
        "{}: {}{}",
        format!("4alat[{}]", err.er.code()).red().bold(),
        err.er.title(),
        info
    );
    eprintln!("  |");
    eprintln!("{} |{}", line_number.to_string().bright_cyan(), line);
    eprintln!(
        "  |{}{}",
        " ".repeat(column),
        "^".repeat(width).red().bold()
    );
}

#[derive(Debug, PartialEq)]
pub enum Er {
    //    FileNotFound,
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
    UnknownVariable,
    DeclarDeclared,
    TypeMismatch,
    VariableNotDeclared,
}
impl Er {
    pub fn code(&self) -> &'static str {
        match self {
            // Self::FileNotFound => "DCE1",
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
            Self::UnknownVariable => "DCE13",
            Self::DeclarDeclared => "DCE14",
            Self::TypeMismatch => "DCE15",
            Self::VariableNotDeclared => "DCE16",
        }
    }
    pub fn title(&self) -> &'static str {
        match self {
            //  Self::FileNotFound => "lmilf mkaynch, 7awl tchof mzyan",
            Self::UnknownSymbol => "had rramz mm3rofch 3ndna",
            Self::InvalidFloat => "hada machi 3dd 3achari m9ad",
            Self::UnknownType => "hada machi naw3 m3rof 3ndna",
            Self::UnCompletString => {
                "had nass mamkmolch, khado isali bwahda mn hado: \" awla \' awla `, (bdakchi li bditi bih nnass dyalk)"
            }
            Self::NewLineString => {
                "chi nass badi b \" maymknch irje3 lstr, so howa lwl awla st3ml: ` awla ' "
            }
            Self::UnExpectedToken => {
                "mknach mtw93in mnk had ramz/lklma, dir chi haja akhra awla chof fin kayn lmoxkil"
            }
            Self::NeedExpr => "na9sk chi ta3bir hna awla chi 9ima",
            Self::InvalidNumber => "hada machi 3dd m9ad, n3l chitan",
            Self::InvalidValue => {
                "hadi machi 9ima m9ada, dir chi 9ima b39lha bhal chi nss chi 3dd etc..."
            }
            Self::ALotOfExpr => "drti bzaf dyal ta3abir ldarajat hadchi mmsmo7x",
            Self::NeedStmt => "na9sk chi t3lima awla 2mr barmaji s7i7",
            Self::UnknownVariable => "had lmotaghayr mma3rofch, 7awl t3rfo howa lwl",
            Self::DeclarDeclared => "chi motaghayr dija m3arf maymknch t3awd t3arfo",
            Self::TypeMismatch => "naw3 dyal had ta3bir mkaywaf9ch nnaw3 li drtih nta",
            Self::VariableNotDeclared => {
                "maymknx tghyr 9ima dyal chi motaghayr mkaynch, 3rfo howa lwl"
            }
        }
    }
}
