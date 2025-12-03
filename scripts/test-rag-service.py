#!/usr/bin/env python3
"""
Test script for RAG service
Validates embedding model, Qdrant connection, and end-to-end RAG pipeline
"""
import sys
import os

# Add rag-service to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'rag-service'))

def test_embedding_model():
    """Test embedding model loading"""
    print("🔍 Testing embedding model...")
    try:
        from app.model_clients import get_embed_model
        model = get_embed_model()
        test_text = "This is a test query"
        embedding = model.encode([test_text])
        print(f"✅ Embedding model loaded: {embedding.shape}")
        print(f"   Model dimension: {model.get_sentence_embedding_dimension()}")
        return True
    except Exception as e:
        print(f"❌ Embedding model test failed: {e}")
        return False

def test_qdrant_connection():
    """Test Qdrant connection"""
    print("\n🔍 Testing Qdrant connection...")
    try:
        from qdrant_client import QdrantClient
        import os
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        client = QdrantClient(url=qdrant_url)
        collections = client.get_collections()
        print(f"✅ Qdrant connected: {qdrant_url}")
        print(f"   Collections: {[c.name for c in collections.collections]}")
        return True
    except Exception as e:
        print(f"❌ Qdrant connection failed: {e}")
        return False

def test_ollama_connection():
    """Test Ollama connection"""
    print("\n🔍 Testing Ollama connection...")
    try:
        from app.model_clients import verify_ollama_available
        if verify_ollama_available():
            print("✅ Ollama is available")
            return True
        else:
            print("⚠️  Ollama is not available (RAG will still work but LLM generation will fail)")
            return False
    except Exception as e:
        print(f"❌ Ollama test failed: {e}")
        return False

def test_retrieval():
    """Test document retrieval"""
    print("\n🔍 Testing document retrieval...")
    try:
        from app.rag_pipeline import retrieve_top_k
        results = retrieve_top_k("test query", k=3)
        print(f"✅ Retrieval test: {len(results)} documents retrieved")
        if results:
            print(f"   Sample result: ID={results[0].get('id')}, Score={results[0].get('score', 0):.4f}")
        return True
    except Exception as e:
        print(f"❌ Retrieval test failed: {e}")
        return False

def test_end_to_end():
    """Test end-to-end RAG pipeline"""
    print("\n🔍 Testing end-to-end RAG pipeline...")
    try:
        from app.rag_pipeline import answer_query
        result = answer_query("What transactions exist?", k=3, verify_numbers=False)
        print(f"✅ End-to-end test completed")
        print(f"   Answer length: {len(result.get('answer', ''))} chars")
        print(f"   Sources: {len(result.get('sources', []))}")
        print(f"   Retrieval count: {result.get('retrieval_count', 0)}")
        return True
    except Exception as e:
        print(f"❌ End-to-end test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("RAG Service Test Suite")
    print("=" * 60)
    
    results = []
    results.append(("Embedding Model", test_embedding_model()))
    results.append(("Qdrant Connection", test_qdrant_connection()))
    results.append(("Ollama Connection", test_ollama_connection()))
    results.append(("Document Retrieval", test_retrieval()))
    results.append(("End-to-End Pipeline", test_end_to_end()))
    
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name:30} {status}")
    
    all_passed = all(r[1] for r in results)
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ All tests passed!")
    else:
        print("⚠️  Some tests failed. Check the output above.")
    print("=" * 60)
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())

