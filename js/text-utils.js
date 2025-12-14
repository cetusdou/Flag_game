// ============================================================================
// 文本处理工具模块 - 处理语言、城市等文本分离
// ============================================================================

// 分离连在一起的语言名称
function separateLanguages(langStr) {
    if (!langStr || typeof langStr !== 'string') return langStr;
    
    const commonLanguages = [
        'Cook Islands Māori', 'New Zealand', 'Sign Language', 'Jersey Legal', 'Carolinian',
        'Papiamento', 'Papiamentu', 'Gilbertese', 'Chamorro', 'Marshallese', 'Palauan',
        'Tokelauan', 'Tuvaluan', 'Seychellois', 'Uruguayan', 'IsiXhosa', 'SiPhuthi',
        'Kinyarwanda', 'Samoan', 'English', 'French', 'German', 'Spanish', 'Italian',
        'Portuguese', 'Dutch', 'Russian', 'Arabic', 'Chinese', 'Japanese', 'Korean',
        'Hindi', 'Turkish', 'Greek', 'Swedish', 'Norwegian', 'Danish', 'Finnish',
        'Icelandic', 'Polish', 'Czech', 'Romanian', 'Bulgarian', 'Serbian', 'Croatian',
        'Slovak', 'Slovenian', 'Hungarian', 'Estonian', 'Latvian', 'Lithuanian',
        'Belarusian', 'Ukrainian', 'Georgian', 'Armenian', 'Azerbaijani', 'Kazakh',
        'Uzbek', 'Turkmen', 'Kyrgyz', 'Tajik', 'Mongolian', 'Vietnamese', 'Thai',
        'Burmese', 'Khmer', 'Lao', 'Malay', 'Indonesian', 'Filipino', 'Tagalog',
        'Swahili', 'Hausa', 'Yoruba', 'Igbo', 'Zulu', 'Xhosa', 'Afrikaans',
        'Amharic', 'Somali', 'Kurdish', 'Persian', 'Pashto', 'Dari', 'Urdu',
        'Bengali', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Gujarati', 'Punjabi',
        'Marathi', 'Nepali', 'Sinhala', 'Hebrew', 'Yiddish', 'Basque', 'Catalan',
        'Galician', 'Welsh', 'Irish', 'Scottish', 'Manx', 'Breton', 'Corsican',
        'Luxembourgish', 'Romansh', 'Faroese', 'Greenlandic', 'Sámi', 'Māori',
        'Guaraní', 'Quechua', 'Aymara', 'Nahuatl', 'Inuktitut', 'Cree', 'Ojibwe',
        'Hawaiian', 'Tahitian', 'Tongan', 'Fijian', 'Malagasy', 'Comorian', 'Kirundi',
        'Luganda', 'Wolof', 'Fulani', 'Tamazight', 'Berber', 'Tigrinya', 'Oromo',
        'Sesotho', 'Setswana', 'Chichewa', 'Lingala', 'Kikongo', 'Tshiluba', 'Sango',
        'Dyula', 'Baoulé', 'Mandinka', 'Fula', 'Norfuk', 'Pitkern', 'Tok Pisin',
        'Hiri Motu', 'PNG Sign', 'NZ Sign', 'Jèrriais', 'Pukapukan', 'Qom', 'Mocoví', 'Wichí'
    ];
    
    const inPattern = /((?:[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+)*)(?:\s*,\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+)*)*(?:\s*,\s*and\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñí]+)*)?)\s+in\s+([A-Z][a-z]+(?:\s+[a-z]+)*(?:\s+(?:del|de|la|le|les|du|des)\s+[A-Z][a-z]+)?)/g;
    const inMatches = [];
    let match;
    
    while ((match = inPattern.exec(langStr)) !== null) {
        inMatches.push({
            full: match[0],
            language: match[1].trim(),
            place: match[2],
            index: match.index
        });
    }
    
    if (inMatches.length > 0) {
        const result = [];
        let lastIndex = 0;
        
        for (const inMatch of inMatches) {
            if (inMatch.index > lastIndex) {
                const before = langStr.substring(lastIndex, inMatch.index).trim();
                if (before) {
                    const beforeParts = processLanguageString(before, commonLanguages);
                    result.push(...beforeParts);
                }
            }
            
            const cleanLanguage = inMatch.language.replace(/\s+/g, ' ').trim();
            result.push(`${cleanLanguage} (in ${inMatch.place})`);
            lastIndex = inMatch.index + inMatch.full.length;
        }
        
        if (lastIndex < langStr.length) {
            const after = langStr.substring(lastIndex).trim();
            if (after) {
                const afterParts = processLanguageString(after, commonLanguages);
                result.push(...afterParts);
            }
        }
        
        return result.filter(p => p.trim()).join('<br>');
    }
    
    return processLanguageString(langStr, commonLanguages).join('<br>');
}

function processLanguageString(langStr, commonLanguages) {
    if (!langStr || typeof langStr !== 'string') return [langStr];
    
    if (/[,;、，；]/.test(langStr)) {
        const parts = langStr.split(/[,;、，；]+/);
        const result = [];
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const trimmed = part.trim();
            if (!trimmed) continue;
            
            if (/\band\b/i.test(trimmed)) {
                if (result.length > 0) {
                    result[result.length - 1] += ', ' + trimmed;
                } else {
                    result.push(trimmed);
                }
            } else if (/^[A-Z][a-z]+[A-Z]/.test(trimmed)) {
                const separated = separateCamelCase(trimmed, commonLanguages);
                result.push(...separated.split('、'));
            } else {
                result.push(trimmed);
            }
        }
        
        return result.filter(p => p.trim());
    }
    
    if (/^[A-Z][a-z]+[A-Z]/.test(langStr)) {
        const separated = separateCamelCase(langStr, commonLanguages);
        return separated.split('、').filter(p => p.trim());
    }
    
    return [langStr];
}

function separateCamelCase(text, languageList) {
    if (!text || typeof text !== 'string') return text;
    
    const sortedLanguages = [...languageList].sort((a, b) => b.length - a.length);
    const result = [];
    let remaining = text;
    
    while (remaining.length > 0) {
        let matched = false;
        for (const lang of sortedLanguages) {
            if (remaining.startsWith(lang)) {
                result.push(lang);
                remaining = remaining.substring(lang.length);
                matched = true;
                break;
            }
        }
        
        if (!matched) {
            const match = remaining.match(/^([a-z]+)([A-Z][a-z]*)/);
            if (match) {
                result.push(match[1]);
                remaining = remaining.substring(match[1].length);
            } else {
                const match2 = remaining.match(/^([A-Z][a-z]*)/);
                if (match2) {
                    result.push(match2[1]);
                    remaining = remaining.substring(match2[1].length);
                } else {
                    if (remaining.trim()) result.push(remaining);
                    break;
                }
            }
        }
    }
    
    if (result.length === 0) {
        const separated = text.replace(/([a-z])([A-Z])/g, '$1、$2');
        return separated;
    }
    
    return result.filter(p => p.trim()).join('、');
}

function separateCities(cityStr) {
    if (!cityStr || typeof cityStr !== 'string') return cityStr;
    
    if (/\)[A-ZÁÉÍÓÚÑ]/.test(cityStr)) {
        const separated = cityStr.replace(/\)([A-ZÁÉÍÓÚÑ])/g, ')<br>$1');
        return separated;
    }
    
    return cityStr;
}

function separateScripts(scriptStr) {
    if (!scriptStr || typeof scriptStr !== 'string') return scriptStr;
    
    // 按逗号分割并换行显示
    return scriptStr.split(',').map(s => s.trim()).filter(s => s).join('<br>');
}

// 暴露到全局
window.separateLanguages = separateLanguages;
window.separateCities = separateCities;
window.separateScripts = separateScripts;

