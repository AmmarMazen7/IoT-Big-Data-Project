import datetime

def sanitize_document(doc):
    """Recursively convert datetime objects to ISO strings for JSON serialization."""
    if isinstance(doc, list):
        return [sanitize_document(item) for item in doc]
    if not isinstance(doc, dict):
        return doc
    
    new_doc = {}
    for key, value in doc.items():
        if isinstance(value, datetime.datetime):
            new_doc[key] = value.isoformat() + "Z"
        elif isinstance(value, dict):
            new_doc[key] = sanitize_document(value)
        elif isinstance(value, list):
            new_doc[key] = [sanitize_document(item) for item in value]
        else:
            new_doc[key] = value
    return new_doc
