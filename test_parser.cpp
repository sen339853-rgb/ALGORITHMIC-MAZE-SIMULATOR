#include <iostream>
#include <string>
#include <cctype>

int parseJsonInt(const std::string& json, const std::string& key, int defaultVal) {
    std::string pattern = "\"" + key + "\"";
    size_t pos = json.find(pattern);
    if (pos == std::string::npos) {
        pattern = key + ":";
        pos = json.find(pattern);
        if (pos == std::string::npos) return defaultVal;
    }
    pos = json.find(':', pos);
    if (pos == std::string::npos) return defaultVal;
    pos++;
    while (pos < json.size() && (json[pos] == ' ' || json[pos] == '\t' || json[pos] == '\"' || json[pos] == '\\')) pos++;
    size_t end = pos;
    while (end < json.size() && (isdigit(json[end]) || json[end] == '-')) end++;
    if (end > pos) {
        try {
            return std::stoi(json.substr(pos, end - pos));
        } catch (...) {}
    }
    return defaultVal;
}

int main() {
    std::string json = "{\"rows\":11,\"cols\":11}";
    std::cout << "rows: " << parseJsonInt(json, "rows", 15) << "\n";
    std::cout << "cols: " << parseJsonInt(json, "cols", 15) << "\n";
    return 0;
}
